import React, { useState } from "react";
import PropTypes from "prop-types";
import placeholder from "src/assets/images/placeholder.webp";
import { Box, Skeleton, type SxProps, type Theme } from "@mui/material";

interface ImageProps {
  width?: string;
  height?: string;
  source: string;
  alt: string;
  style?: React.CSSProperties;
  isLoading?: string;
  objectFit?: any;
  sx?: SxProps<Theme>;
}

const Image = ({
  width,
  height,
  source,
  alt,
  style,
  isLoading,
  sx,
  objectFit = "cover",
}: ImageProps) => {
  const [hasLoaded, setLoaded] = useState(false);

  if (!source) return null;

  const handleOnLoad = () => {
    setLoaded(true);
  };

  return (
    <Box
      style={{
        borderRadius: "inherit",
        width,
        height,
        ...style,
      }}
      sx={{
        ...sx,
      }}
    >
      {!isLoading && (
        <img
          alt={alt}
          src={source}
          onError={({ currentTarget }) => {
            currentTarget.src = placeholder;
          }}
          onLoad={handleOnLoad}
          width="100%"
          height="100%"
          style={{
            objectFit,
            objectPosition: "center",
            borderRadius: "inherit",
            position: hasLoaded ? "relative" : "absolute",
            opacity: hasLoaded ? 1 : 0,
          }}
        />
      )}
      {!hasLoaded || isLoading ? (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          style={{
            borderRadius: "inherit",
            objectFit,
            objectPosition: "center",
          }}
        />
      ) : null}
    </Box>
  );
};

Image.propTypes = {
  width: PropTypes.string.isRequired,
  height: PropTypes.string,
  source: PropTypes.string,
  objectFit: PropTypes.string,
  alt: PropTypes.string.isRequired,
  style: PropTypes.object,
  sx: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default Image;
