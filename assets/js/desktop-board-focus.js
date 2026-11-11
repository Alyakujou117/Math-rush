    /* Desktop compact game header: move the ORIGINAL action buttons, preserving
       their registered listeners, to reclaim vertical board space in normal windows.
       The original title row is restored in fullscreen/mobile/other screens. */
    (function () {
      'use strict';
      const screen = document.getElementById('gameScreen');
      const title = screen?.querySelector(':scope > .screen-title');
      const boardHeading = screen?.querySelector('.board-heading');
      const actions = title?.lastElementChild;
      if (!title || !boardHeading || !actions || !document.getElementById('rrFullscreenBtn')) return;
      actions.id = 'rrDesktopGameActions';
      const originalParent = actions.parentNode;
      const placeholder = document.createComment('Original race controls position');
      originalParent.insertBefore(placeholder, actions);
      const mq = matchMedia('(min-width:960px) and (min-height:601px), (min-width:1110px) and (min-height:480px) and (max-height:600px)');
      let scheduled = 0;
      function refresh() {
        scheduled = 0;
        const focused = mq.matches && document.body.classList.contains('in-game') && !screen.classList.contains('hidden') && !document.fullscreenElement;
        document.body.classList.toggle('rr-desktop-board-focus', focused);
        const parent = focused ? boardHeading : originalParent;
        let moved = false;
        if (actions.parentNode !== parent) {
          if (focused) boardHeading.appendChild(actions);
          else originalParent.insertBefore(actions, placeholder.nextSibling);
          moved = true;
        }
        // Both pre-existing board-fit handlers listen for resize; request a fit only
        // when the toolbar actually moves.
        if (moved) window.dispatchEvent(new Event('resize'));
      }
      // Avoid a recursive resize event; only real changes should trigger relayout.
      let lastMode = '';
      function schedule() {
        const desired = String(mq.matches && document.body.classList.contains('in-game') && !screen.classList.contains('hidden') && !document.fullscreenElement);
        if (lastMode === desired) return;
        lastMode = desired;
        if (!scheduled) scheduled = requestAnimationFrame(refresh);
      }
      new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['class'] });
      new MutationObserver(schedule).observe(screen, { attributes: true, attributeFilter: ['class'] });
      document.addEventListener('fullscreenchange', schedule);
      window.addEventListener('resize', schedule, { passive: true });
      if (mq.addEventListener) mq.addEventListener('change', schedule);
      schedule();
    })();

  
