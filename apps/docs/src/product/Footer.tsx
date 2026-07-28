import { Row, Text } from "@nmmty/dotmatrix";
import { schema } from "../resources/config";

export function Footer() {
  return (
    <Row as="footer" justifyContent="center" padding="24">
      <Text fontSize="xs" color="weak">
        {schema.name} — MIT licensed.
      </Text>
    </Row>
  );
}
