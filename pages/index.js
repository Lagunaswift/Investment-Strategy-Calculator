import PortfolioCalculator from '../components/PortfolioCalculator'; // Adjust path if needed
import Head from 'next/head'; // Optional: For setting page title, meta tags

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Investment Portfolio Calculator</title>
        <meta name="description" content="Calculate your monthly investment allocations and projections." />
        {/* Add other meta tags or link tags here */}
      </Head>
      <main>
        {/* You could add headers, footers, or other layout elements here */}
        <PortfolioCalculator />
      </main>
    </div>
  );
}
