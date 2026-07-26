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
      const autoSync = widget.getAttribute('data-auto-sync') !== 'false';

      // Auto-detect if not manually provided and autoSync is enabled
      if (autoSync) {
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

    // Initialize popup widgets
    const popupWidgets = document.querySelectorAll('.linksmeet-popup-widget');
    popupWidgets.forEach(widget => {
      if (widget.hasAttribute('data-initialized')) return;
      widget.setAttribute('data-initialized', 'true');

      let iframeUrl = widget.getAttribute('data-url');
      if (!iframeUrl) return;

      const btnText = widget.getAttribute('data-text') || 'Book a meeting';
      const btnColor = widget.getAttribute('data-color') || '#7d3bec';
      const textColor = widget.getAttribute('data-text-color') || '#ffffff';

      // Build the query string
      const urlObj = new URL(iframeUrl);
      urlObj.searchParams.append('primary', btnColor);

      // Create Floating Button
      const btn = document.createElement('button');
      btn.innerHTML = btnText;
      btn.style.position = 'fixed';
      btn.style.bottom = '24px';
      btn.style.right = '24px';
      btn.style.backgroundColor = btnColor;
      btn.style.color = textColor;
      btn.style.border = 'none';
      btn.style.borderRadius = '30px';
      btn.style.padding = '14px 28px';
      btn.style.fontSize = '16px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      btn.style.zIndex = '999998';
      btn.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      btn.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
      
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
      };
      btn.onmouseout = () => {
        btn.style.transform = 'none';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      };

      // Create Overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
      overlay.style.zIndex = '999999';
      overlay.style.display = 'none';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.backdropFilter = 'blur(4px)';

      // Create Modal Container
      const modal = document.createElement('div');
      modal.style.width = '100%';
      modal.style.maxWidth = '1060px'; // Matching the large layout width of booking page
      modal.style.height = '90vh';
      modal.style.maxHeight = '800px';
      modal.style.backgroundColor = 'transparent';
      modal.style.borderRadius = '20px';
      modal.style.position = 'relative';
      modal.style.overflow = 'hidden';
      
      // Responsive adjustments for mobile
      if (window.innerWidth <= 768) {
        modal.style.width = '100%';
        modal.style.height = '100vh';
        modal.style.maxHeight = 'none';
        modal.style.borderRadius = '0';
      }

      // Close Button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '16px';
      closeBtn.style.right = '24px';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '32px';
      closeBtn.style.color = '#1a1a1a';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.zIndex = '10';
      closeBtn.style.lineHeight = '1';

      // Iframe
      const iframe = document.createElement('iframe');
      iframe.src = urlObj.toString();
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.background = 'transparent';
      iframe.setAttribute('allowtransparency', 'true');

      modal.appendChild(closeBtn);
      modal.appendChild(iframe);
      overlay.appendChild(modal);

      // Event Listeners
      btn.onclick = () => {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      };

      const closePopup = () => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      };

      closeBtn.onclick = closePopup;
      overlay.onclick = (e) => {
        if (e.target === overlay) closePopup();
      };

      document.body.appendChild(btn);
      document.body.appendChild(overlay);
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
