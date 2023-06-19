import styles from "./Framework.module.css";

interface Props {
  label: string;
  children?: React.ReactNode;
}

const Framework = ({ label, children }: Props) => {
  return (
    <div className="tooltip" data-tip={label}>
      <div
        aria-label={label}
        className={`${styles.Framework} rounded-box flex justify-center items-center p-4 text-content bg-accent/10 w-20 h-20`}
      >
        {children}
      </div>
    </div>
  );
};

export default Framework;
