import { SidebarRoot } from '../sidebar/SidebarRoot';
import { CategorySelector } from '../custom-fields/CategorySelector';
import { BlogSelector } from '../custom-fields/BlogSelector';
import { DiscountSelector } from '../custom-fields/DiscountSelector';
import { ColorPicker } from '../custom-fields/ColorPicker';
import { ImagePicker } from '../custom-fields/ImagePicker';
import { Slider } from '../custom-fields/Slider';
import { Spacing } from '../custom-fields/Spacing';
import { TextField } from '../custom-fields/TextField';
import { Toggle } from '../custom-fields/Toggle';
import { VideoPicker } from '../custom-fields/VideoPicker';
import { LinkSelector } from '../custom-fields/LinkSelector';
import { MenuSelector } from '../custom-fields/MenuSelector';
import { ProductSelector } from '../custom-fields/ProductSelector';
import { PositionPicker } from '../custom-fields/PositionPicker';

export const puckOverrides = {
  // Replace entire left sidebar with our custom implementation
  sidebar: SidebarRoot,

  // Right sidebar will now render fields automatically using our custom field components
  // Custom fields are defined in puck.config.tsx using type: "custom"

  // Custom field types - allows themes to use new field types without importing from frontend
  fieldTypes: {
    categorySelector: CategorySelector,
    productSelector: ProductSelector,
    blogSelector: BlogSelector,
    discountSelector: DiscountSelector,
    colorPicker: ColorPicker,
    imagePicker: ImagePicker,
    slider: Slider,
    spacing: Spacing,
    textField: TextField,
    toggle: Toggle,
    videoPicker: VideoPicker,
    linkSelector: LinkSelector,
    menuSelector: MenuSelector,
    positionPicker: PositionPicker,
  },
};