import { useEffect } from 'react';

// Phones: turn every table into expandable rows. Each row shows its name
// (first labelled column), icon/action columns and a chevron; tapping the
// row reveals the other columns as "Label: value" lines.
//
// Works on any table without page changes: column labels are copied from
// the table header into data attributes, and CSS in the theme does the
// layout (see MuiTable in theme/components.js).
const PHONE_QUERY = '(max-width: 599.95px)';
const INTERACTIVE =
  'button, a, input, select, textarea, label, [role="button"], .collection-actions';

const headerLabels = (table) => {
  const row = table.tHead?.rows?.[table.tHead.rows.length - 1];
  const labels = [];
  if (row) {
    Array.from(row.cells).forEach((cell) => {
      const text = cell.textContent.trim();
      for (let i = 0; i < (cell.colSpan || 1); i += 1) {
        labels.push(text);
      }
    });
  }
  return labels;
};

const labelTable = (table) => {
  const labels = headerLabels(table);
  table.setAttribute('data-mobile-cards', '');
  Array.from(table.tBodies).forEach((body) => {
    Array.from(body.rows).forEach((row) => {
      let column = 0;
      let primaryFound = false;
      let details = 0;
      const cells = Array.from(row.cells);
      cells.forEach((cell) => {
        const label = labels[column] || '';
        column += cell.colSpan || 1;
        let kind;
        if (cells.length === 1 || cell.querySelector('.collection-actions')) {
          kind = 'fixed';
        } else if (!label) {
          kind = 'fixed';
        } else if (!primaryFound) {
          kind = 'primary';
          primaryFound = true;
        } else {
          kind = 'detail';
          details += 1;
        }
        if (cell.getAttribute('data-cell-kind') !== kind) {
          cell.setAttribute('data-cell-kind', kind);
        }
        if (cell.getAttribute('data-label') !== label) {
          cell.setAttribute('data-label', label);
        }
      });
      if (details === 1) {
        // Two-column tables (name / value): show the value inline.
        cells
          .filter((cell) => cell.getAttribute('data-cell-kind') === 'detail')
          .forEach((cell) => cell.setAttribute('data-cell-kind', 'inline'));
        details = 0;
      }
      if (details > 0) {
        row.setAttribute('data-has-details', '');
      } else {
        row.removeAttribute('data-has-details');
      }
    });
  });
};

const MobileTableEnhancer = () => {
  useEffect(() => {
    let frame = null;
    const labelAll = () => {
      frame = null;
      document.querySelectorAll('table').forEach(labelTable);
    };
    const schedule = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(labelAll);
      }
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();

    const onClick = (event) => {
      if (!window.matchMedia(PHONE_QUERY).matches) {
        return;
      }
      const row = event.target.closest('table[data-mobile-cards] tbody tr[data-has-details]');
      if (!row || event.target.closest(INTERACTIVE)) {
        return;
      }
      row.classList.toggle('row-expanded');
    };
    document.addEventListener('click', onClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return null;
};

export default MobileTableEnhancer;
