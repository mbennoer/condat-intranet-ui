/* ============================================================
   condat-intranet-ui — globales Akkordeon-Skript
   Für alle Intranet-Seiten per <script defer> im HEAD eingebunden.
   Gehört zusammen mit condat-intranet-ui.css (Klassen .ci-toc,
   .ci-chapter, .ci-chapter-body).

   Funktionsweise:
   - Klick auf eine .ci-toc-Kachel oder auf eine <summary> öffnet das
     zugehörige Kapitel und schließt alle anderen auf der Seite.
   - Direktaufruf per URL-Hash (Lesezeichen, externer Link) öffnet
     das passende Kapitel automatisch.
   - Andere Kapitel werden vor dem Scrollen SYNCHRON selbst
     geschlossen (nicht über das toggle-Event der <details>-Elemente,
     das laut Spezifikation asynchron als "queued task" feuert — sonst
     wäre das vorherige Kapitel beim Scrollen noch offen und man landet
     zu weit unten auf der Seite).

   WICHTIG bei mehreren unabhängigen Akkordeons auf einer Seite: Dieses
   Skript behandelt alle .ci-chapter-Elemente der Seite als EINE Gruppe
   (öffnet man eines, schließen sich alle anderen). Falls zwei fachlich
   getrennte Akkordeons gleichzeitig unabhängig offen bleiben sollen,
   müsste das Skript um eine Gruppierung (z. B. per data-Attribut)
   erweitert werden — aktuell nicht der Fall in den bestehenden Seiten.
   ============================================================ */
(function () {
  function init() {
    var chapters = document.querySelectorAll('.ci-chapter');
    if (!chapters.length) return;

    chapters.forEach(function (chapter) {
      chapter.addEventListener('toggle', function () {
        if (chapter.open) {
          chapters.forEach(function (other) {
            if (other !== chapter) other.removeAttribute('open');
          });
        }
      });
    });

    function openAndScrollTo(el) {
      if (!el || el.tagName !== 'DETAILS' || !el.classList.contains('ci-chapter')) return;
      chapters.forEach(function (other) {
        if (other !== el) other.removeAttribute('open');
      });
      el.setAttribute('open', '');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.querySelectorAll('.ci-toc a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash.charAt(0) !== '#') return;
        var el = document.querySelector(hash);
        if (!el) return;
        e.preventDefault();
        openAndScrollTo(el);
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', hash);
        } else {
          window.location.hash = hash;
        }
      });
    });

    function openChapterFromHash() {
      var hash = window.location.hash;
      if (!hash) return;
      openAndScrollTo(document.querySelector(hash));
    }
    openChapterFromHash();
    window.addEventListener('hashchange', openChapterFromHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
