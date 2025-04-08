'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store/store';
import * as d3 from 'd3';
import { Node, Link, setSelectedNode } from '@/app/store/graphSlice';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

export default function GraphVisualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any>(null);
  const dispatch = useDispatch();
  
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const links = useSelector((state: RootState) => state.graph.links);
  const selectedNode = useSelector((state: RootState) => state.graph.selectedNode);
  const inflows = useSelector((state: RootState) => state.graph.inflows);
  const outflows = useSelector((state: RootState) => state.graph.outflows);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // D3 force simulation setup
    const width = 800;
    const height = 600;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
      
    svg.selectAll('*').remove();
    
    // Create deep copies of nodes and links to avoid modifying Redux state
    const nodesCopy = nodes.map(node => ({...node}));
    const linksCopy = links.map(link => ({...link}));
    
    // Add a group for arrows
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28) // Position at the edge of the circle
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", darkMode ? "#bbb" : "#666");
    
    // Use the copied arrays for the simulation
    const simulation = d3.forceSimulation(nodesCopy)
      .force('link', d3.forceLink(linksCopy).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Create links with arrows
    const link = svg.append('g')
      .selectAll('path')
      .data(linksCopy)
      .enter()
      .append('path')
      .attr("marker-end", "url(#arrow)")
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.amount || 1) + 1)
      .attr('fill', 'none');
    
    // Add link labels for transaction amounts
    const linkLabels = svg.append('g')
      .selectAll('text')
      .data(linksCopy)
      .enter()
      .append('text')
      .attr('font-size', '8px')
      .attr('fill', darkMode ? '#ddd' : '#333')
      .text((d: any) => {
        // Format amount to 6 decimal places
        return d.amount.toFixed(6) + ' BTC';
      });

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodesCopy)
      .enter()
      .append('g')
      .call(d3.drag<SVGGElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circle for each node
    node.append('circle')
      .attr('r', 20)
      .attr('fill', (d: Node) => getNodeColor(d.entity_name))
      .attr('stroke', (d: Node) => d.id === selectedNode ? '#ff0' : darkMode ? '#fff' : '#000')
      .attr('stroke-width', (d: Node) => d.id === selectedNode ? 3 : 1);

    // Add text label for entity name
    node.append('text')
      .text((d: Node) => d.entity_name)
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('fill', darkMode ? '#fff' : '#000')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');
    
    // Add wallet address (shortened)
    node.append('text')
      .text((d: Node) => shortenAddress(d.id))
      .attr('text-anchor', 'middle')
      .attr('dy', 45)
      .attr('fill', darkMode ? '#ddd' : '#555')
      .attr('font-size', '8px');

    // Node click handler
    node.on('click', function(event: MouseEvent, d: Node) {
      dispatch(setSelectedNode(d.id));
      // Get detailed info about this node
      const nodeInflows = inflows.filter(flow => flow.beneficiary_address === d.id);
      const nodeOutflows = outflows.filter(flow => flow.payer_address === d.id);
      
      setSelectedNodeDetails({
        address: d.id,
        entity: d.entity_name,
        inflows: nodeInflows,
        outflows: nodeOutflows,
        totalIn: nodeInflows.reduce((sum, flow) => sum + flow.amount, 0),
        totalOut: nodeOutflows.reduce((sum, flow) => sum + flow.amount, 0)
      });
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Update link paths for proper arrows
      link.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        // Calculate the angle
        const angle = Math.atan2(dy, dx);
        // Positions for start and end of the curve
        return `M${d.source.x},${d.source.y} 
                A${Math.abs(dx)},${Math.abs(dy)} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      // Update link labels
      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 5);

      // Update node positions
      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, any, any>, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, any, any>, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, any, any>, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Implement zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: any) => {
        svg.selectAll('g').attr('transform', event.transform.toString());
      });

    svg.call(zoom as any);

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNode, darkMode, dispatch, inflows, outflows]);

  // Helper function to shorten wallet address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  // Helper function to get color based on entity name
  const getNodeColor = (entityName: string) => {
    const colorMap: {[key: string]: string} = {
      'Unknown': '#aaa',
      'Whitebit': '#89CFF0',
      'Changenow': '#90EE90',
      'Default': '#FFA07A'
    };
    
    return colorMap[entityName] || colorMap.Default;
  };

  // Function to export the graph as PNG
  const exportAsPNG = () => {
    if (containerRef.current) {
      toPng(containerRef.current)
        .then((dataUrl) => {
          saveAs(dataUrl, 'wallet-connections.png');
        })
        .catch((error) => {
          console.error('Error exporting image:', error);
        });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between p-2 border-b">
        <div className="flex space-x-2">
          <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">
            {nodes.length} Nodes • {links.length} Connections
          </div>
        </div>
        <button 
          className="bg-green-500 text-white px-4 py-1 rounded"
          onClick={exportAsPNG}
        >
          SAVE AS PNG
        </button>
      </div>
      
      <div className="flex flex-1">
        <div ref={containerRef} className={`flex-1 overflow-hidden ${darkMode ? 'bg-black' : 'bg-white'}`}>
          <svg ref={svgRef} className="w-full h-full" />
        </div>
        
        {selectedNodeDetails && (
          <div className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 overflow-y-auto`}>
            <h3 className="font-bold text-lg border-b pb-2 mb-2">Node Details</h3>
            <div className="mb-3">
              <div className="font-semibold">{selectedNodeDetails.entity}</div>
              <div className="text-xs break-all">{selectedNodeDetails.address}</div>
            </div>
            
            <div className="flex justify-between mb-2">
              <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
                In: {selectedNodeDetails.totalIn.toFixed(8)} BTC
              </div>
              <div className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs px-2 py-1 rounded">
                Out: {selectedNodeDetails.totalOut.toFixed(8)} BTC
              </div>
            </div>
            
            <div className="text-sm font-semibold mt-4 mb-1">Transactions:</div>
            {selectedNodeDetails.inflows.map((flow: any, idx: number) => (
              <div key={`in-${idx}`} className="border-l-2 border-blue-500 pl-2 mb-2 text-xs">
                <div className="font-semibold">Inflow: {flow.amount} BTC</div>
                <div className="text-gray-500 dark:text-gray-400">{flow.date}</div>
              </div>
            ))}
            
            {selectedNodeDetails.outflows.map((flow: any, idx: number) => (
              <div key={`out-${idx}`} className="border-l-2 border-red-500 pl-2 mb-2 text-xs">
                <div className="font-semibold">Outflow: {flow.amount} BTC</div>
                <div className="text-gray-500 dark:text-gray-400">{flow.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 