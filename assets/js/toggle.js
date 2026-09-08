// Generic two-pane toggle. Expects:
//   [data-toggle-group] wrapping [data-toggle-btn][data-target] buttons
//   and one or more [data-toggle-pane][id] panes matching those targets.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-toggle-group]').forEach(function (group) {
    var buttons = group.querySelectorAll('[data-toggle-btn]');
    var panes = document.querySelectorAll('[data-toggle-pane]');

    function activate(targetId) {
      buttons.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.target === targetId);
      });
      panes.forEach(function (pane) {
        pane.hidden = pane.id !== targetId;
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn.dataset.target);
      });
    });

    var initial = group.querySelector('[data-toggle-btn].active') || buttons[0];
    if (initial) activate(initial.dataset.target);
  });
});
