# Udoy Iconography

Udoy consumes [Heroicons](https://heroicons.com/) through a shared helper so
client applications get a consistent set of SVGs, default sizing, and
accessibility rules without re-implementing anything locally.

## Usage

```jsx
import { HeroIcon } from '../../../shared/icons';

function EmptyState() {
  return (
    <div className="card stack-md items-center text-center">
      <HeroIcon name="AcademicCapIcon" className="text-brand-500" />
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
| `name` | `string` | — | Heroicon component name (e.g. `AcademicCapIcon`). |
| `style` | `'outline' \| 'solid' \| 'mini'` | `'outline'` | Icon family to pull from. |
| `size` | `'xs' \| 'sm' \| 'base' \| 'md' \| 'lg' \| 'xl'` | `'base'` | Applies preset sizing tokens (`icon--*`). |
| `title` | `string` | `undefined` | Optional accessible title rendered on the `<svg>`. |
| `decorative` | `boolean` | `true` unless `title` is provided | When `false`, the icon is exposed to assistive tech (sets `role="img"`). |
| `className` | `string` | `''` | Additional Tailwind classes merged with the shared icon styles. |

### Direct icon access

If you need to render the raw SVG component (for example, inside a charting
library), import it from the registry:

```js
import { getHeroIcon } from '../../../shared/icons';

const AcademicCap = getHeroIcon('AcademicCapIcon');
```

You can also introspect available icon names via `heroIconNames`. Outline,
solid, and mini sets mirror the official Heroicons distribution.
