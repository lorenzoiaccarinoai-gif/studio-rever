const toggle = document.querySelector(".nav-toggle");
const mobile = document.querySelector(".nav-mobile");
if (toggle && mobile) {
  toggle.addEventListener("click", () => {
    const open = !mobile.hasAttribute("hidden");
    if (open) {
      mobile.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Apri menu");
    } else {
      mobile.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Chiudi menu");
    }
  });
  mobile.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobile.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Apri menu");
    });
  });
}

// Mostra i PDF in una finestra nella pagina, senza scaricarli.
(function () {
  var links = document.querySelectorAll('[data-pdf-viewer]');
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;

  var PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  var libraryPromise;

  function loadLibrary() {
    if (!libraryPromise) {
      libraryPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = PDFJS_BASE + 'pdf.min.js';
        script.onload = function () {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.js';
          resolve(window.pdfjsLib);
        };
        script.onerror = function () {
          libraryPromise = null;
          reject(new Error('PDF.js non disponibile'));
        };
        document.head.appendChild(script);
      });
    }
    return libraryPromise;
  }

  var dialog = document.createElement('dialog');
  dialog.className = 'pdf-dialog';
  dialog.innerHTML = '<div class="pdf-dialog-bar"><strong class="pdf-dialog-title"></strong>' +
    '<button type="button" class="pdf-dialog-close" aria-label="Chiudi">&times;</button></div>' +
    '<div class="pdf-dialog-body"><p class="pdf-dialog-status" role="status"></p></div>';
  document.body.appendChild(dialog);

  var title = dialog.querySelector('.pdf-dialog-title');
  var body = dialog.querySelector('.pdf-dialog-body');
  var status = dialog.querySelector('.pdf-dialog-status');
  var currentRun = 0;

  function clearPages() {
    body.querySelectorAll('canvas').forEach(function (canvas) { canvas.remove(); });
  }

  function open(link) {
    var run = ++currentRun;
    clearPages();
    title.textContent = link.dataset.pdfTitle || link.textContent.trim();
    status.textContent = 'Caricamento del documento…';
    status.hidden = false;
    dialog.setAttribute('aria-label', title.textContent);
    dialog.showModal();

    loadLibrary().then(function (pdfjsLib) {
      return pdfjsLib.getDocument(link.href).promise;
    }).then(function (pdf) {
      var chain = Promise.resolve();
      var available = body.clientWidth;
      var density = Math.max(window.devicePixelRatio || 1, 2);
      for (var n = 1; n <= pdf.numPages; n++) {
        (function (number) {
          chain = chain.then(function () {
            if (run !== currentRun) return null;
            return pdf.getPage(number).then(function (page) {
              if (run !== currentRun) return null;
              var base = page.getViewport({ scale: 1 });
              var viewport = page.getViewport({ scale: (available * density) / base.width });
              var canvas = document.createElement('canvas');
              canvas.width = Math.floor(viewport.width);
              canvas.height = Math.floor(viewport.height);
              canvas.setAttribute('role', 'img');
              canvas.setAttribute('aria-label', title.textContent + ', pagina ' + number + ' di ' + pdf.numPages);
              return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise.then(function () {
                if (run !== currentRun) return;
                status.hidden = true;
                body.appendChild(canvas);
                if (number === 1) body.scrollTop = 0;
              });
            });
          });
        })(n);
      }
      return chain;
    }).catch(function () {
      if (run !== currentRun) return;
      status.textContent = 'Non è stato possibile mostrare il documento. Riprova più tardi.';
    });
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      open(link);
    });
  });

  dialog.querySelector('.pdf-dialog-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { currentRun++; clearPages(); });
})();
