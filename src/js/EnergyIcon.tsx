import { FC, memo } from "react";

const EnergyIconComponent: FC = () =>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        style={{ fillRule: "evenodd", clipRule: 'evenodd' }}
        viewBox="0 0 600 1000"
    >
        <path
            d="M319.805 399.652c16.534-3.52 269.384-51.266 269.384-51.266L178.848 995.053s93.784-347.275 103.03-379.478c-6.352 1.237-250.621 45.783-250.621 45.783L396.331 6.048s-71.098 373.353-76.526 393.604Z"
            style={{ fill: 'currentcolor' }}
        />
    </svg>

export const EnergyIcon = memo(EnergyIconComponent);
