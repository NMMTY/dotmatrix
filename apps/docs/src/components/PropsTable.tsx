import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@nmmty/dotmatrix";
import { getComponentDoc } from "../lib/manifest";

export function PropsTable({ name }: { name: string }) {
  const doc = getComponentDoc(name);

  if (!doc || doc.props.length === 0) {
    return (
      <Text fontSize="s" color="weak">
        No prop reference available for this component.
      </Text>
    );
  }

  return (
    <Table zebra>
      <TableHead>
        <tr>
          <TableHeaderCell>Prop</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Default</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {doc.props.map((prop) => (
          <TableRow key={prop.name}>
            <TableCell>
              {prop.name}
              {prop.required ? " *" : ""}
            </TableCell>
            <TableCell>
              {prop.kind === "select" ? (prop.options ?? []).join(" | ") : prop.kind}
            </TableCell>
            <TableCell>{prop.defaultValue ?? "—"}</TableCell>
            <TableCell>{prop.description || "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
