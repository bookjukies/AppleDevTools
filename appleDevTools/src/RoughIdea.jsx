import { useState, useRef, useEffect } from 'react';

// The main component that wraps any element you want to inspect
export const StyleInspector = ({ children, enabled = true }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [styles, setStyles] = useState({});
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const panelRef = useRef(null);

  // Categories of CSS properties to display
  const styleCategories = {
    Layout: ['display', 'position', 'top', 'right', 'bottom', 'left', 'width', 'height', 'box-sizing'],
    Spacing: ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
              'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    Typography: ['font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'color'],
    Visual: ['background-color', 'border', 'border-radius', 'box-shadow', 'opacity', 'z-index'],
    Flex: ['flex', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap'],
    Grid: ['grid-template-columns', 'grid-template-rows', 'grid-gap', 'grid-column', 'grid-row'],
    Transform: ['transform', 'transition', 'animation']
  };

  useEffect(() => {
    if (isInspecting && targetRef.current) {
      const computed = window.getComputedStyle(targetRef.current);
      const allStyles = {};
      
      // Get all computed styles
      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i];
        allStyles[prop] = computed.getPropertyValue(prop);
      }
      
      setStyles(allStyles);
      
      // Get element dimensions and position
      const rect = targetRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height
      });
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
  }, [isInspecting]);

  // Position the panel so it doesn't go off screen
  useEffect(() => {
    if (isInspecting && panelRef.current) {
      const panelRect = panelRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let panelTop = position.top + dimensions.height + 10;
      let panelLeft = position.left;
      
      // Check if panel would go off bottom of screen
      if (panelTop + panelRect.height > viewportHeight) {
        panelTop = Math.max(10, position.top - panelRect.height - 10);
      }
      
      // Check if panel would go off right of screen
      if (panelLeft + panelRect.width > viewportWidth) {
        panelLeft = Math.max(10, viewportWidth - panelRect.width - 10);
      }
      
      panelRef.current.style.top = `${panelTop}px`;
      panelRef.current.style.left = `${panelLeft}px`;
    }
  }, [isInspecting, position, dimensions]);

  const toggleInspection = () => {
    setIsInspecting(!isInspecting);
  };

  if (!enabled) return children;

  // Extract property name and value for display
  const formatProperty = (prop, value) => {
    return { 
      name: prop,
      value: value
    };
  };

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ 
        position: 'relative',
        outline: isHovering ? '2px dashed blue' : 'none',
        cursor: isHovering ? 'pointer' : 'default'
      }}
      onClick={(e) => {
        if (isHovering) {
          e.stopPropagation();
          toggleInspection();
        }
      }}
    >
      {children}
      
      {isHovering && !isInspecting && (
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '0',
          background: 'rgba(0, 100, 255, 0.8)',
          color: 'white',
          fontSize: '10px',
          padding: '2px 5px',
          borderRadius: '3px',
          zIndex: 9999998
        }}>
          Click to inspect
        </div>
      )}
      
      {isInspecting && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            width: '350px',
            maxHeight: '500px',
            overflow: 'auto',
            backgroundColor: '#2d2d2d',
            color: '#f0f0f0',
            borderRadius: '6px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            zIndex: 9999999,
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '10px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold' }}>Style Inspector</div>
            <button
              onClick={() => setIsInspecting(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f0f0f0',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#3a3a3a', borderRadius: '4px' }}>
            <div>
              <span style={{ color: '#88ccff' }}>Width:</span> {dimensions.width.toFixed(0)}px
              <span style={{ marginLeft: '15px', color: '#88ccff' }}>Height:</span> {dimensions.height.toFixed(0)}px
            </div>
            <div>
              <span style={{ color: '#88ccff' }}>Position:</span> {styles.position}
              <span style={{ marginLeft: '15px', color: '#88ccff' }}>Display:</span> {styles.display}
            </div>
          </div>
          
          {Object.entries(styleCategories).map(([category, properties]) => (
            <div key={category} style={{ marginBottom: '15px' }}>
              <div style={{ 
                fontWeight: 'bold', 
                borderBottom: '1px solid #555',
                marginBottom: '5px',
                paddingBottom: '3px',
                color: '#ffcc66'
              }}>
                {category}
              </div>
              
              {properties.map(prop => {
                const value = styles[prop];
                if (!value || value === 'none' || value === 'normal' || value === '0px') return null;
                
                const { name, value: displayValue } = formatProperty(prop, value);
                
                return (
                  <div key={name} style={{ marginBottom: '3px', display: 'flex' }}>
                    <span style={{ 
                      color: '#88ccff',
                      minWidth: '140px', 
                      display: 'inline-block'
                    }}>
                      {name}:
                    </span>
                    <span style={{ color: '#aaffaa' }}>{displayValue}</span>
                  </div>
                );
              })}
            </div>
          ))}
          
          <div style={{ borderTop: '1px solid #555', paddingTop: '8px', marginTop: '5px' }}>
            <details>
              <summary style={{ cursor: 'pointer', color: '#bbbbbb' }}>All Computed Styles</summary>
              <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '5px' }}>
                {Object.entries(styles).map(([prop, value]) => (
                  <div key={prop} style={{ fontSize: '11px', marginBottom: '2px' }}>
                    <span style={{ color: '#88ccff' }}>{prop}:</span> {value}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

// Usage example component
export default function RoughIdea() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Style Inspector Demo</h2>
      <p>Hover over the elements below and click to inspect their styles:</p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <StyleInspector>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            width: '200px'
          }}>
            This is a box with some padding, background and border-radius.
          </div>
        </StyleInspector>
        
        <StyleInspector>
          <button style={{ 
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Styled Button
          </button>
        </StyleInspector>
        
        <StyleInspector>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            border: '1px solid #ddd',
            width: '150px'
          }}>
            <div>Flex Item 1</div>
            <div>Flex Item 2</div>
            <div>Flex Item 3</div>
          </div>
        </StyleInspector>
      </div>
    </div>
  );
}