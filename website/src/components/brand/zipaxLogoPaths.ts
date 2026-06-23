export type ZipaxLogoLayer = {
  name: "primary" | "secondary" | "tertiary";
  path: string;
  opacity: number;
  depth: number;
  delay: number;
};

export const ZIPAX_LOGO_VIEWBOX = 140;

export const ZIPAX_LOGO_LAYERS: readonly ZipaxLogoLayer[] = [
  {
    name: "primary",
    path: "M114.89 83.2471C115.283 84.152 116.379 88.46 116.379 88.46L125.92 124.72L56.718 85.0708L30.2785 69.4947C30.2785 69.4947 50.1796 64.0129 59.9378 61.5968C65.9913 60.1892 72.2628 57.7355 78.5276 57.6073C95.703 57.2553 109.253 67.5782 114.89 83.2471Z",
    opacity: 1,
    depth: 0.11,
    delay: 0,
  },
  {
    name: "secondary",
    path: "M103.627 44.2722L28.9829 64.4839L38.7311 47.2197C44.843 36.3309 48.9894 28.8512 62.6722 26.7012C74.0503 24.9133 81.6545 31.691 91.0168 36.8074C95.0714 39.0231 103.627 44.2722 103.627 44.2722Z",
    opacity: 0.88,
    depth: 0,
    delay: 55,
  },
  {
    name: "tertiary",
    path: "M52.2308 13.1045L24.3453 61.8083C24.3453 61.8083 21.9679 53.2962 20.9624 49.5335C18.9873 41.8848 15.9649 34.8015 20.5793 27.3726C25.2387 19.8707 31.5226 18.6017 39.3329 16.5254L52.2308 13.1045Z",
    opacity: 0.68,
    depth: -0.1,
    delay: 110,
  },
];
