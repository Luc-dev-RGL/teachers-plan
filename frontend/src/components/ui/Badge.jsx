const styles = {
  succes: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  default: 'badge-default',
};

export default function Badge({ variant = 'default', children }) {
  return <span className={styles[variant] || styles.default}>{children}</span>;
}