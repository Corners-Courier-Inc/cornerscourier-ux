(function(){
      const slides = Array.from(document.querySelectorAll('[data-slide]'));
      let idx = 0;
      function prefetchNext(n){
        const next = slides[(n+1) % slides.length];
        if (!next) return;
        const img = next.querySelector('img');
        if (!img) return;
        const imageUrl = img.src;
        if (!imageUrl) return;
        const l = document.createElement('link');
        l.rel = 'prefetch';
        l.as = 'image';
        l.href = imageUrl;
        document.head.appendChild(l);
      }
      prefetchNext(idx);
      setInterval(function(){ idx = (idx+1) % slides.length; prefetchNext(idx); }, 5000);
    })();