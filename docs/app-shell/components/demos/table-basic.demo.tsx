import { Table, Badge } from "@tailor-platform/app-shell";

const orders = [
  { id: "ORD-001", customer: "Alice Johnson", amount: "$1,250.00", status: "success" as const, date: "2025-03-15" },
  { id: "ORD-002", customer: "Bob Smith", amount: "$890.00", status: "warning" as const, date: "2025-03-14" },
  { id: "ORD-003", customer: "Carol Lee", amount: "$2,100.00", status: "error" as const, date: "2025-03-13" },
  { id: "ORD-004", customer: "Dave Wilson", amount: "$450.00", status: "success" as const, date: "2025-03-12" },
];

const statusLabels = { success: "Shipped", warning: "Pending", error: "Cancelled" };

export default function Demo() {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Order</Table.Head>
          <Table.Head>Customer</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head style={{ textAlign: "right" }}>Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {orders.map((order) => (
          <Table.Row key={order.id}>
            <Table.Cell>{order.id}</Table.Cell>
            <Table.Cell>{order.customer}</Table.Cell>
            <Table.Cell>
              <Badge variant={order.status}>{statusLabels[order.status]}</Badge>
            </Table.Cell>
            <Table.Cell style={{ textAlign: "right" }}>{order.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
