import { Button, Column, Heading, Text } from "@nmmty/dotmatrix";
import Link from "next/link";

export default function HomePage() {
  return (
    <Column gap="16" style={{ maxWidth: 640 }}>
      <Heading as="h1" displaySize="l">
        dotmatrix
      </Heading>
      <Text fontSize="m" color="medium">
        A monochrome bitmap design system — pixel typography, dither/halftone graphics, segmented
        indicators, and hard-edged shadows. Layout is built from primitives, never raw tags.
      </Text>
      <Button as={Link} href="/get-started" variant="solid">
        Get started
      </Button>
    </Column>
  );
}
