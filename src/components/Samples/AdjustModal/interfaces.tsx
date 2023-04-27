interface QueryCondition {
  id: number;
  column: string;
  operator: string;
  value: string;
  temp?: boolean;
}

export {
  QueryCondition,
};
