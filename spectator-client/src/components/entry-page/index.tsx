import Button from "@mui/joy/Button";

import styles from "./styles.module.scss";

type IProps = {
  onStart: () => void;
};

export const EntryPage: React.FC<IProps> = ({ onStart }) => {
  return (
    <div className={styles.root}>
      <Button variant="solid" onClick={onStart}>
        Start
      </Button>
    </div>
  );
};
