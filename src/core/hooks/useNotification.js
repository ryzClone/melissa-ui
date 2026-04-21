import { useContext } from "react";
import { NotificationContext } from "../notification/NotificationContext";

export const useNotification = () => useContext(NotificationContext);
