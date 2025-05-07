import React from "react";

interface DeliveryIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const DeliveryIcon: React.FC<DeliveryIconProps> = ({
  width = 40,
  height = 40,
  color = "#FFFF00",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_34_1228)">
        <path
          d="M6.91888 18.8022L9.70264 20.122V15.538C9.70264 15.2822 9.84496 15.0478 10.0717 14.9301L28.9815 5.11165L26.485 3.84277L6.91888 13.9865V18.8022Z"
          fill={color}
        />
        <path
          d="M0.859772 10.2177L6.20873 12.8123L24.973 3.0843L19.9991 0.560059L0.859772 10.2177Z"
          fill={color}
        />
        <path
          d="M11.8506 15.5488L20.2162 19.6066L39.153 10.2803L30.4772 5.87744L11.8506 15.5488Z"
          fill={color}
        />
        <path
          d="M0 30.076L19.5347 39.44V20.7977L11.0702 16.6919V21.2035C11.0702 21.6963 10.5404 22.0339 10.0938 21.8223L5.94256 19.8543C5.70368 19.741 5.55136 19.5 5.55136 19.2354V14.015L0 11.3223L0 30.076Z"
          fill={color}
        />
        <path
          d="M25.9167 32.0211L34.9854 27.5812V18.7983L25.9167 23.2647V32.0211Z"
          fill={color}
        />
        <path
          d="M20.9022 20.7948V39.4297L40 30.0798V11.3892L20.9022 20.7948ZM36.353 28.0084C36.353 28.2699 36.2042 28.5086 35.9695 28.6236L25.5332 33.733C25.0854 33.9521 24.5491 33.6136 24.5491 33.1178V22.838C24.5491 22.5771 24.6973 22.3388 24.9311 22.2236L35.3674 17.0838C35.8149 16.8636 36.353 17.2014 36.353 17.6982V28.0084Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_34_1228">
          <rect width="40" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DeliveryIcon;
