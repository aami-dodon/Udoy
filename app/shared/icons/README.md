# Udoy Iconography

Udoy consumes [Lucide](https://lucide.dev/) through a shared helper so
client applications get a consistent set of SVGs, default sizing, and
accessibility rules without re-implementing anything locally.

## Usage

```jsx
import { LucideIcon } from '../../../shared/icons';

function EmptyState() {
  return (
    <div className="card stack-md items-center text-center">
      <LucideIcon name="GraduationCap" className="text-brand-500" />
      <h2 className="text-heading-md">No courses yet</h2>
      <p className="text-body-sm text-neutral-600">
        Launch your first course to see it appear here.
      </p>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `name` | `string` | — | Lucide component name (e.g. `GraduationCap`). |
| `fallbackName` | `string` | `undefined` | Optional backup icon name if the primary icon cannot be resolved. |
| `weight` | `'thin' \| 'regular' \| 'bold'` | `'regular'` | Maps to the shared stroke presets (`icon--thin`, `icon--regular`, `icon--bold`). |
| `size` | `'xs' \| 'sm' \| 'base' \| 'md' \| 'lg' \| 'xl'` | `'base'` | Applies preset sizing tokens (`icon--*`). |
| `strokeWidth` | `number \| string` | Derived from `weight` | Overrides the stroke width passed to the SVG. |
| `title` | `string` | `undefined` | Optional accessible title rendered on the `<svg>`. |
| `decorative` | `boolean` | `true` unless `title` is provided | When `false`, the icon is exposed to assistive tech (sets `role="img"`). |
| `className` | `string` | `''` | Additional Tailwind classes merged with the shared icon styles. |

### Direct icon access

If you need to render the raw SVG component (for example, inside a charting
library), import it from the registry:

```js
import { getLucideIcon } from '../../../shared/icons';

const GraduationCap = getLucideIcon('GraduationCap');
```

You can also introspect available icon names via `lucideIconNames`. The
registry reflects the Lucide React distribution and normalizes component names
without the trailing `Icon` suffix.
