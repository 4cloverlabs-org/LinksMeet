(function() {
  window.LinksMeet = window.LinksMeet || {};
  
  window.LinksMeet.init = function() {
    // Find the script tag to get the domain (only needed for legacy support)
    const scripts = document.getElementsByTagName('script');
    let currentScript = null;
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes('widget.js')) {
        currentScript = scripts[i];
        break;
      }
    }

    // Initialize all widgets on the page
    const widgets = document.querySelectorAll('.linksmeet-inline-widget, .linksmeet-booking');
    widgets.forEach(widget => {
      // Don't double initialize
      if (widget.hasAttribute('data-initialized')) return;
      widget.setAttribute('data-initialized', 'true');

      let iframeUrl = widget.getAttribute('data-url');
      
      // Fallback for older .linksmeet-booking widgets (backwards compatibility)
      if (!iframeUrl && widget.classList.contains('linksmeet-booking')) {
         const uid = currentScript ? currentScript.getAttribute('data-uid') : null;
         const slug = widget.getAttribute('data-event');
         if (uid && slug && currentScript) {
           const url = new URL(currentScript.src);
           iframeUrl = `${url.origin}/book/${uid}/${slug}`;
         }
      }

      if (!iframeUrl) return;

      // Detect parent site colors for seamless blending
      let bgColor = widget.getAttribute('data-background-color');
      let textColor = widget.getAttribute('data-text-color');
      let primaryColor = widget.getAttribute('data-primary-color');

      // Auto-detect if not manually provided
      if (!bgColor || !textColor) {
        try {
          const parentStyles = window.getComputedStyle(widget.parentElement || document.body);
          
          // Auto-detect text color
          if (!textColor) {
            textColor = parentStyles.color;
          }

          // Auto-detect background color (walk up tree to find non-transparent background)
          if (!bgColor) {
            let currentEl = widget.parentElement;
            let tempBg = parentStyles.backgroundColor;
            while (currentEl && (tempBg === 'transparent' || tempBg === 'rgba(0, 0, 0, 0)' || !tempBg)) {
              tempBg = window.getComputedStyle(currentEl).backgroundColor;
              currentEl = currentEl.parentElement;
            }
            if (tempBg && tempBg !== 'transparent' && tempBg !== 'rgba(0, 0, 0, 0)') {
              bgColor = tempBg;
            } else {
              bgColor = '#ffffff';
            }
          }
        } catch (e) {
          console.warn('LinksMeet Widget: Could not auto-detect styles.', e);
        }
      }

      // Auto-detect primary accent color (look for first button or links on the page)
      if (!primaryColor) {
        try {
          const link = document.querySelector('a, button');
          if (link) {
            primaryColor = window.getComputedStyle(link).color || window.getComputedStyle(link).backgroundColor;
          }
        } catch (e) {}
        if (!primaryColor || primaryColor === 'transparent' || primaryColor === 'rgba(0, 0, 0, 0)') {
          primaryColor = '#006bff'; // Default fallback
        }
      }

      // Build the query string
      const urlObj = new URL(iframeUrl);
      if (bgColor) urlObj.searchParams.append('bg', bgColor);
      if (textColor) urlObj.searchParams.append('text', textColor);
      if (primaryColor) urlObj.searchParams.append('primary', primaryColor);

      const iframe = document.createElement('iframe');
      iframe.src = urlObj.toString();
      iframe.style.width = '100%';
      iframe.style.height = '100%'; 
      iframe.style.border = 'none';
      iframe.style.background = 'transparent';
      iframe.setAttribute('allowtransparency', 'true');
      
      // Clear out any placeholder
      widget.innerHTML = '';
      widget.appendChild(iframe);
    });
  };

  // Run init on load
  window.LinksMeet.init();

  // Listen for resize messages from the iframes
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'linksmeet-resize') {
      const iframes = document.querySelectorAll('.linksmeet-inline-widget iframe, .linksmeet-booking iframe');
      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === e.source) {
          const parent = iframes[i].parentElement;
          
          if (parent && parent.classList.contains('linksmeet-inline-widget')) {
            // NEVER override the user's explicit dimensions on the inline widget!
            iframes[i].style.height = '100%';
          } else {
            // For legacy .linksmeet-booking widgets without explicit containers, dynamic resize is kept
            iframes[i].style.height = e.data.height + 'px';
          }
          break;
        }
      }
    }
  });
})();
