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
        <hr style={{width: "75%", margin: "auto"}}/>
        <section className="hero">
          <div className="container text--center">
            <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
              Support the project
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9', maxWidth: '800px', margin: '0 auto 2rem' }}>
              Support BookLogr by becoming a <Link to="https://github.com/sponsors/Mozzo1000" style={{textDecoration: 'underline', color: 'inherit'}}>sponsor</Link>, 
              reporting bugs, or contributing on <Link to="https://github.com/mozzo1000/booklogr" style={{textDecoration: 'underline', color: 'inherit'}}>GitHub</Link>. 
              Read about our <Link to="/sponsor" style={{textDecoration: 'underline', color: 'inherit'}}>monthly costs.</Link>.
            </p>
            
            <div>
              <Link
                style={{marginRight: '1rem'}}
                className="button button--outline button--secondary button--lg"
                to="https://github.com/sponsors/Mozzo1000">
                ❤️ Sponsor on GitHub
              </Link>
              <Link
                className="button button--outline button--secondary button--lg"
                to="https://github.com/mozzo1000/booklogr">
                <img src="https://github.com/fluidicon.png" width="20" style={{marginRight: '8px', verticalAlign: 'middle'}} />
                View on GitHub
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
