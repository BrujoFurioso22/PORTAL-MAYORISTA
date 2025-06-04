// components/RenderIcon.jsx
import * as FiIcons from "react-icons/fi";
import * as AiIcons from "react-icons/ai";
import * as MdIcons from "react-icons/md";
import * as FaIcons from "react-icons/fa";
import * as RiIcons from "react-icons/ri";
import * as BsIcons from "react-icons/bs";
import * as LuIcons from "react-icons/lu";
import { FiHelpCircle } from "react-icons/fi";
import { useAppTheme } from "../../context/AppThemeContext";

const iconLibraries = {
  1: { prefix: "Fi", icons: FiIcons }, // Feather
  2: { prefix: "Ai", icons: AiIcons }, // Ant Design
  3: { prefix: "Md", icons: MdIcons }, // Material Design
  4: { prefix: "Fa", icons: FaIcons }, // FontAwesome
  5: { prefix: "Ri", icons: RiIcons }, // Remix
  6: { prefix: "Bs", icons: BsIcons }, // Bootstrap
  7: { prefix: "Lu", icons: LuIcons }, // Bootstrap
};

export default function RenderIcon({
  name = "",
  library = 1,
  size = 24,
  color,
  style,
  ...props
}) {
  const { colors } = useAppTheme();

  const selectedLibrary = iconLibraries[library];

  if (!selectedLibrary || !name) {
    return <FiHelpCircle size={size} style={{ color: "red" }} {...props} />;
  }

  const { prefix, icons } = selectedLibrary;
  const iconName = prefix + name; // Ej: Fi + ArrowLeft

  const IconComponent = icons[iconName];

  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        style={{
          color: color || colors?.text, // Color personalizado o del tema
          stroke: color || "currentColor", // Forzar stroke
          ...style, // Estilos adicionales
        }}
        {...props}
      />
    );
  }

  return <FiHelpCircle size={size} style={{ color: "red" }} {...props} />;
}
