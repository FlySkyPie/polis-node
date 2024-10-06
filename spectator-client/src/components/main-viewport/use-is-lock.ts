
import { useEffect, useRef, useState } from "react";

type IProps = {
    lockTarget: HTMLElement | null;
};

export const useIsLock = ({ lockTarget }: IProps) => {
    const [isLock, setLock] = useState(false);

    const lockTargetRef = useRef(lockTarget);
    lockTargetRef.current = lockTarget;
    useEffect(() => {
        const handler = () => {
            if (lockTargetRef.current === document.pointerLockElement) {
                setLock(true);
                return;
            }
            setLock(false);
        };

        addEventListener("pointerlockchange", handler);

        return () => {
            removeEventListener("pointerlockchange", handler);
        }
    }, []);

    return { isLock };
};
