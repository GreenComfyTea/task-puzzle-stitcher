import styles from "./page.module.css";
import ClientPage from "./client-page/page";

export default function Home() {
	return (
		<main className={styles.main}>
			<ClientPage />
		</main>
	);
}

