import { Button, Column, Heading, Text } from "@nmmty/dotmatrix";

export default function HomePage() {
  return (
    <Column gap="16" style={{ maxWidth: 640 }} height={'full'} justifyContent={'center'} alignItems={'center'}>
      <Heading as="h1" displaySize="l">
        dotmatrix
      </Heading>
      <Text fontSize="m" color="medium">
        A monochrome bitmap design system — pixel typography, dither/halftone graphics, segmented
        indicators, and hard-edged shadows. Layout is built from primitives, never raw tags.
      </Text>
      <Button width={'full'} href="/get-started" variant="solid">
        Get started
      </Button>
    </Column>
  );
}
