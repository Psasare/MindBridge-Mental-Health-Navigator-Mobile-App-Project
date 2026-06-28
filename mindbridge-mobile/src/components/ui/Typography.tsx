import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme/colors';

interface TypographyProps extends TextProps {
  variant?: Exclude<keyof typeof theme.typography, 'fonts'>;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  // @ts-ignore - We know these variants exist on theme.typography
  const variantStyle = theme.typography[variant] || theme.typography.body;

  const resolvedColor = color || theme.colors.text.primary;

  return (
    <Text
      style={[
        variantStyle,
        { color: resolvedColor, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const H1: React.FC<TypographyProps> = (props) => <Typography variant="h1" {...props} />;
export const H2: React.FC<TypographyProps> = (props) => <Typography variant="h2" {...props} />;
export const H3: React.FC<TypographyProps> = (props) => <Typography variant="h3" {...props} />;
export const H4: React.FC<TypographyProps> = (props) => <Typography variant="h4" {...props} />;
export const Body: React.FC<TypographyProps> = (props) => <Typography variant="body" {...props} />;
export const BodyBold: React.FC<TypographyProps> = (props) => <Typography variant="bodyBold" {...props} />;
export const UILabel: React.FC<TypographyProps> = (props) => <Typography variant="label" {...props} />;
export const Caption: React.FC<TypographyProps> = (props) => <Typography variant="caption" {...props} />;
