import satori from "satori";

interface Color {
  background: string;
  text: string;
  name: string;
}

const PRICE_COLOR_MAP: Record<number, Color> = {
  100: {
    background: "rgba(30,136,229,1)",
    text: "rgba(255,255,255,1)",
    name: "rgba(255,255,255,0.7019607843137254)",
  },
  200: {
    background: "rgba(0,229,255,1)",
    text: "rgba(0,0,0,1)",
    name: "rgba(0,0,0,0.7019607843137254)",
  },
  500: {
    background: "rgba(29,233,182,1)",
    text: "rgba(0,0,0,1)",
    name: "rgba(0,0,0,0.5411764705882353)",
  },
  1000: {
    background: "rgba(255,202,40,1)",
    text: "rgba(0,0,0,0.8745098039215686)",
    name: "rgba(0,0,0,0.5411764705882353)",
  },
  2000: {
    background: "rgba(245,124,0,1)",
    text: "rgba(255,255,255,0.8745098039215686)",
    name: "rgba(255,255,255,0.7019607843137254)",
  },
  5000: {
    background: "rgba(233,30,99,1)",
    text: "rgba(255,255,255,1)",
    name: "rgba(255,255,255,0.7019607843137254)",
  },
  10000: {
    background: "rgba(230,33,23,1)",
    text: "rgba(255,255,255,1)",
    name: "rgba(255,255,255,0.7019607843137254)",
  },
};

function getColor(price: number): Color {
  return Object.entries(PRICE_COLOR_MAP).reduce((acc, [key, value]) => {
    if (parseInt(key) <= price) {
      return value;
    }
    return acc;
  }, {} as Color);
}

interface Props {
  price: number;
  name: string;
  iconSrc?: string;
  message?: string;
}

function Component({ price, name, iconSrc, message }: Props) {
  const color = getColor(price);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        backgroundColor: color.background,
        color: color.text,
        fontSize: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          fontWeight: "500",
        }}
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            width={80}
            height={80}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              marginRight: "16px",
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
          }}
        >
          <span
            style={{
              color: color.name,
              fontSize: "14px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
          <span
            style={{
              paddingLeft: "8px",
            }}
          >
            ￥{price}
          </span>
        </div>
      </div>
      {message && (
        <div
          style={{
            padding: "8px 16px",
            paddingTop: "0",
            wordBreak: "break-word",
            wordWrap: "break-word",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
