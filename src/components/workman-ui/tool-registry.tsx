"use client";

import { ActionButton } from "./tools/ActionButton";
import { SmartProductCard } from "./tools/products/SmartProductCard";

/**
 * The tools prop in MessagePrimitive.Content expects a ToolsConfig.
 * According to @assistant-ui/core/react, ToolsConfig is either:
 * 1. { by_name: Record<string, ComponentType<ToolCallMessagePartProps>> }
 * 2. { Override: ComponentType<ToolCallMessagePartProps> }
 */
export const WorkmanToolRegistry = {
  by_name: {
    ui_action_button: ActionButton,
    smart_product_card: SmartProductCard,
  },
};
