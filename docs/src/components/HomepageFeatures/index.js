import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

const FeatureList = [
  {
    title: 'Build your virtual library',
    Img: "/img/feature_section_01.png",
    pos: "left",
    description: (
      <>
        Add your books to lists depending on if you have <strong>read</strong> them, are 
        <strong> currently reading</strong> or <strong>want to read</strong>.
      </>
    ),
  },
  {
    title: 'Share Your Reading Journey',
    Img: "/img/feature_section_02.png",
    pos: "right",
    description: (
      <>
        Let your friends see what you are currently reading and what you have finished. It is a simple way to showcase your taste in books and keep others in the loop on your reading journey.
      </>
    ),
  },
  {
    title: 'Find Your Favorite Books in Seconds',
    Img: "/img/feature_section_03.png",
    pos: "left",
    description: (
      <>
        Powered by <a className="link" href="https://openlibrary.org" target="_blank">OpenLibrary</a>. You can search through millions of titles — with new books added every day. Discover old favorites, explore new reads, and build your library effortlessly.
      </>
    ),
  },
];

function Feature({Img, title, description, pos}) {
  return (
    <div class="row text--justify padding-bottom--xl">
        {pos === "right" &&
          <>
          <div class="col col--6 center-both">
            <div>

              <h2 style={{fontWeight: 800}}>{title}</h2>
              <p className='lead'>{description}</p>

            </div>
          </div>
          <div class="col col--6">
            <div>
              <img src={Img} />
            </div>
          </div>
          </>
        }
        {pos === "left" &&
          <>
          <div class="col col--6">
              <div>
                <img src={Img} />
              </div>
            </div>
            <div class="col col--6 center-both">
              <div>
                <h2 style={{fontWeight: 800}}>{title}</h2>
                <p className='lead'>{description}</p>
              </div>
            </div>
          </>
        }
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container padding-top--lg">
         {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
      </div>
    </section>
  );
}
