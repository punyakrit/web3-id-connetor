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

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
      
    svg.selectAll('*').remove();
    
    // Create a gradient for the background
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'graph-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', darkMode ? '#2A2B37' : '#f7f7f7');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', darkMode ? '#1F2027' : '#ffffff');
    
    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#graph-gradient)');
    
    // Add grid pattern
    if (darkMode) {
      const gridPattern = defs.append('pattern')
        .attr('id', 'grid')
        .attr('width', 50)
        .attr('height', 50)
        .attr('patternUnits', 'userSpaceOnUse');
      
      gridPattern.append('path')
        .attr('d', 'M 50 0 L 0 0 0 50')
        .attr('fill', 'none')
        .attr('stroke', '#333')
        .attr('stroke-width', '0.5');
      
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'url(#grid)');
    }
    
    const nodesCopy = nodes.map(node => ({...node}));
    const linksCopy = links.map(link => ({...link}));
    
    // Add glow filter for nodes
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
    
    // Add a glow filter for selected nodes
    const selectedFilter = defs.append('filter')
      .attr('id', 'selected-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    selectedFilter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'coloredBlur');
    
    const selectedFeMerge = selectedFilter.append('feMerge');
    selectedFeMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    selectedFeMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
    
    // Add a group for arrows
    defs.selectAll('marker')
      .data(['end', 'selected-end'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => d === 'selected-end' ? '#8B5CF6' : darkMode ? '#aaa' : '#666');
    
    const simulation = d3.forceSimulation(nodesCopy)
      .force('link', d3.forceLink(linksCopy).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.07))
      .force('y', d3.forceY(height / 2).strength(0.07));

    const linkGroup = svg.append('g').attr('class', 'links');
    
    // Create links with arrows
    const link = linkGroup.selectAll('path')
      .data(linksCopy)
      .enter()
      .append('path')
      .attr("marker-end", d => (d.source === selectedNode || d.target === selectedNode) ? "url(#selected-end)" : "url(#end)")
      .attr('stroke', d => (d.source === selectedNode || d.target === selectedNode) ? '#8B5CF6' : darkMode ? '#555' : '#ccc')
      .attr('stroke-opacity', d => (d.source === selectedNode || d.target === selectedNode) ? 0.9 : 0.5)
      .attr('stroke-width', d => (d.source === selectedNode || d.target === selectedNode) ? Math.sqrt(d.amount || 1) + 2 : Math.sqrt(d.amount || 1) + 1)
      .attr('fill', 'none')
      .attr('class', 'link-path');
    
    // Add link labels for transaction amounts
    const linkLabels = svg.append('g')
      .selectAll('text')
      .data(linksCopy)
      .enter()
      .append('text')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('fill', d => (d.source === selectedNode || d.target === selectedNode) ? '#8B5CF6' : darkMode ? '#aaa' : '#666')
      .attr('opacity', d => (d.source === selectedNode || d.target === selectedNode) ? 1 : 0.7)
      .attr('font-weight', d => (d.source === selectedNode || d.target === selectedNode) ? 'bold' : 'normal')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text(d => d.amount.toFixed(6) + ' BTC');

    // Create nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    const node = nodeGroup.selectAll('g')
      .data(nodesCopy)
      .enter()
      .append('g')
      .attr('class', 'node')
      .classed('node-selected', d => d.id === selectedNode)
      .call(d3.drag<SVGGElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circle for each node
    node.append('circle')
      .attr('r', 22)
      .attr('fill', d => getNodeColor(d.entity_name))
      .attr('stroke', d => d.id === selectedNode ? '#8B5CF6' : darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')
      .attr('stroke-width', d => d.id === selectedNode ? 3 : 1.5)
      .attr('filter', d => d.id === selectedNode ? 'url(#selected-glow)' : 'url(#glow)');

    // Add inner circle with entity icon/initial
    node.append('circle')
      .attr('r', 16)
      .attr('fill', d => {
        const baseColor = getNodeColor(d.entity_name);
        return d3.color(baseColor)?.brighter(0.5)?.toString() || baseColor;
      })
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 1);

    // Add entity initial or icon
    node.append('text')
      .text(d => d.entity_name.charAt(0))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', darkMode ? '#fff' : '#333')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px');
    
    // Add text label for entity name
    node.append('text')
      .text(d => d.entity_name)
      .attr('text-anchor', 'middle')
      .attr('dy', 40)
      .attr('fill', d => d.id === selectedNode ? '#8B5CF6' : darkMode ? '#fff' : '#000')
      .attr('font-size', '12px')
      .attr('font-weight', d => d.id === selectedNode ? 'bold' : 'normal')
      .attr('filter', d => d.id === selectedNode ? 'url(#glow)' : 'none');
    
    // Add wallet address (shortened)
    node.append('text')
      .text(d => shortenAddress(d.id))
      .attr('text-anchor', 'middle')
      .attr('dy', 55)
      .attr('fill', darkMode ? '#aaa' : '#666')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    // Node click handler
    node.on('click', function(event: MouseEvent, d: Node) {
      dispatch(setSelectedNode(d.id));
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
      // Update link paths for proper arrows with curved paths
      link.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve strength
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      // Update link labels
      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      // Update node positions
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
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

    // Update the zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: any) => {
        svg.selectAll('g.nodes, g.links').attr('transform', event.transform);
      });

    svg.call(zoom as any)
      .on('wheel.zoom', null);

    containerRef.current?.addEventListener('wheel', (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const delta = event.deltaY * -0.01;
        const transform = d3.zoomTransform(svg.node()!);
        const newScale = Math.max(0.1, Math.min(10, transform.k + delta));
        
        const rect = containerRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        zoom.translateTo(svg as any, x, y);
        zoom.scaleTo(svg as any, newScale);
      }
    }, { passive: false });

    return () => {
      simulation.stop();
      containerRef.current?.removeEventListener('wheel', () => {});
    };
  }, [nodes, links, selectedNode, darkMode, dispatch, inflows, outflows]);

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  const getNodeColor = (entityName: string) => {
    const colorMap: {[key: string]: string} = {
      'Unknown': darkMode ? '#64748b' : '#94a3b8',
      'Whitebit': '#3b82f6',
      'Changenow': '#10b981',
      'Default': '#f59e0b'
    };
    
    return colorMap[entityName] || colorMap.Default;
  };

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
      <div className="flex justify-between items-center p-4 border-b border-gray-700/30 backdrop-blur-sm bg-opacity-70 bg-gray-800">
        <div className="flex space-x-4 items-center">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span>{nodes.length} Nodes • {links.length} Connections</span>
          </div>
          
          <div className="hidden md:flex space-x-2">
            <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium dark:bg-indigo-900 dark:text-indigo-300">BTC</div>
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium dark:bg-gray-700 dark:text-gray-300">Blockchain</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
            onClick={exportAsPNG}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>SAVE AS PNG</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-1">
        <div 
          ref={containerRef} 
          className="flex-1 overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          <svg ref={svgRef} className="w-full h-full" />
        </div>
        
        {selectedNodeDetails && (
          <div className={`w-80 ${darkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm shadow-xl p-5 overflow-y-auto transition-all duration-300 ease-in-out border-l border-gray-700/30`}>
            <h3 className="font-bold text-xl mb-4 flex items-center justify-between">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Node Details</span>
              <button 
                onClick={() => setSelectedNodeDetails(null)}
                className="text-gray-400 hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-700/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </h3>
            
            <div className={`mb-5 p-4 rounded-xl ${darkMode ? 'bg-gray-700/40' : 'bg-gray-100/70'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg`} style={{backgroundColor: getNodeColor(selectedNodeDetails.entity)}}>
                  {selectedNodeDetails.entity.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedNodeDetails.entity}</div>
                  <div className="text-xs font-mono opacity-70 truncate max-w-[200px]">{selectedNodeDetails.address}</div>
                </div>
              </div>
              
              <div className="flex gap-2 text-sm">
                <div className="flex-1 bg-gradient-to-r from-blue-500/10 to-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                  <div className="text-blue-500 font-semibold">Inflow</div>
                  <div className="font-mono text-sm font-bold">{selectedNodeDetails.totalIn.toFixed(8)} BTC</div>
                </div>
                <div className="flex-1 bg-gradient-to-r from-purple-500/10 to-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                  <div className="text-purple-500 font-semibold">Outflow</div>
                  <div className="font-mono text-sm font-bold">{selectedNodeDetails.totalOut.toFixed(8)} BTC</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="font-medium text-sm uppercase tracking-wider opacity-70">Transactions</div>
              
              {selectedNodeDetails.inflows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-blue-500 font-medium text-sm">Inflows</div>
                  {selectedNodeDetails.inflows.map((flow: any, idx: number) => (
                    <div key={`in-${idx}`} className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border-l-2 border-blue-500`}>
                      <div className="flex justify-between">
                        <div className="font-medium text-sm">{flow.entity_name || 'Unknown'}</div>
                        <div className="font-mono font-bold text-blue-500">{flow.amount.toFixed(8)}</div>
                      </div>
                      <div className="text-xs opacity-60 mt-1">{flow.date}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedNodeDetails.outflows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-purple-500 font-medium text-sm">Outflows</div>
                  {selectedNodeDetails.outflows.map((flow: any, idx: number) => (
                    <div key={`out-${idx}`} className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'} border-l-2 border-purple-500`}>
                      <div className="flex justify-between">
                        <div className="font-medium text-sm">{flow.entity_name || 'Unknown'}</div>
                        <div className="font-mono font-bold text-purple-500">{flow.amount.toFixed(8)}</div>
                      </div>
                      <div className="text-xs opacity-60 mt-1">{flow.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 