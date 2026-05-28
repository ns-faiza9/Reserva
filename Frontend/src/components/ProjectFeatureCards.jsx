import { CalendarRange, Search, Building2 } from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarRange,
    title: 'Smart scheduling',
    description:
      'Pick from and to dates and times in one flow. Reserva checks availability so you never double-book the same space.',
    accent: false,
  },
  {
    icon: Search,
    title: 'Search & recommendations',
    description:
      'Describe what you need in plain language and discover matching venues. Members see suggestions based on past bookings.',
    accent: true,
  },
  {
    icon: Building2,
    title: 'Spaces that scale',
    description:
      'From boutique meeting rooms to conference halls — browse our growing catalog and reserve in a few clicks.',
    accent: false,
  },
];

const ProjectFeatureCards = () => (
  <section className="project-features">
    <header className="project-features__header">
      <span className="page-eyebrow">Why Reserva</span>
      <h2 className="heading-serif project-features__title">
        Everything you need to <span className="text-accent">book space</span>
      </h2>
    </header>
    <div className="project-features__grid">
      {FEATURES.map(({ icon: Icon, title, description, accent }) => (
        <article
          key={title}
          className={`project-feature-card ${accent ? 'project-feature-card--accent' : ''}`}
        >
          <div className="project-feature-card__icon">
            <Icon size={28} strokeWidth={1.75} />
          </div>
          <h3 className="heading-serif project-feature-card__title">{title}</h3>
          <p className="project-feature-card__text">{description}</p>
        </article>
      ))}
    </div>
  </section>
);

export default ProjectFeatureCards;
