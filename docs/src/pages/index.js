import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <>
    <header className={clsx('hero ', styles.heroBanner)}>
      <div className="container">
                  <img src="img/icon.svg" height={200} />

        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <h2 className="hero__subtitle">{siteConfig.tagline}</h2>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/Getting%20started">
            Get started
          </Link>
          <Link className="button button--secondary button--lg" to="https://demo.booklogr.app">
            Try demo
          </Link>

        </div>
        
      </div>
    </header>
    <hr style={{width: "75%", margin: "auto"}}/>
    </>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={``}
      description="Self-hosted reading tracker">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className="hero hero--secondary" >
          <div className="container text--center">
            <h2>And many more features</h2>
           <Link
              className="button button--primary"
              to="/docs/Features/Share-to-Mastodon">
              Learn more
            </Link>
            </div>
        </section>
      </main>
    </Layout>
  );
}
