import { Column, Grid, Icon, iconNames, Text } from "@nmmty/dotmatrix";

/** Every glyph in the catalog, read from `iconNames` — never a hand-maintained list. */
export function IconGrid() {
  return (
    <Grid columns="6" gap="16" s={{ columns: "3" }}>
      {iconNames.map((name) => (
        <Column key={name} gap="4" alignItems="center">
          <Icon name={name} size="l" title={name} />
          <Text fontSize="2xs" color="weak" style={{ textAlign: "center" }}>
            {name}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}
