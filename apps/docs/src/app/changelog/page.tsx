import { Badge, Column, Heading, Line, Row, Text } from "@nmmty/dotmatrix";
import type { Metadata } from "next";
import { changelog } from "../../resources/changelog";

export const metadata: Metadata = { title: "Changelog" };

export default function ChangelogPage() {
  return (
    <Column gap="32" style={{ maxWidth: 720 }}>
      <Heading as="h1" displaySize="l">
        Changelog
      </Heading>

      {changelog.map((entry, index) => (
        <Column key={entry.version} gap="16">
          <Row gap="8" alignItems="center">
            <Heading as="h2" displaySize="xs">
              {entry.version}
            </Heading>
            <Badge>{entry.date}</Badge>
          </Row>
          <Column as="ul" gap="8">
            {entry.changes.map((change) => (
              <Text as="li" key={change} fontSize="s" color="medium">
                {change}
              </Text>
            ))}
          </Column>
          {index < changelog.length - 1 && <Line marginTop="8" />}
        </Column>
      ))}
    </Column>
  );
}
