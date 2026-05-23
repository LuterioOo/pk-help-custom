import ru from "./locales/ru";
import uk from "./locales/uk";
import en from "./locales/en";
import pl from "./locales/pl";

const messages = { ru, uk, en, pl } as const;

export default messages;

export type Messages = typeof ru;
