/**
 * @workspace/ui/primitives - Atoms Layer
 *
 * Componentes fundamentais do design system.
 * Esta camada só pode importar tokens, utils e hooks.
 */

// === FORM PRIMITIVES ===
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { Input } from './Input';
export type { InputProps } from './Input';

export { PasswordInput } from './PasswordInput';
export type { PasswordInputProps } from './PasswordInput';

export { PasswordStrength } from './PasswordStrength';
export type {
  PasswordRequirement,
  PasswordStrengthLevel,
  PasswordStrengthProps,
} from './PasswordStrength';

export { SocialButton } from './SocialButton';
export type { SocialButtonProps } from './SocialButton';

// === FEEDBACK PRIMITIVES ===
export { ErrorAlert } from './ErrorAlert';
export type { ErrorAlertProps } from './ErrorAlert';

// === LAYOUT PRIMITIVES ===
export { Divider } from './Divider';
export type { DividerProps } from './Divider';

export { DragHandle } from './DragHandle';
export type { DragHandleProps } from './DragHandle';

export { ExpandableSection } from './ExpandableSection';
export type { ExpandableSectionProps } from './ExpandableSection';

// === THEME PRIMITIVES ===
export { ThemeToggle } from './ThemeToggle';
export type { ThemeToggleProps } from './ThemeToggle';
