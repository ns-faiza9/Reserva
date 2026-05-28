import { useGithubResources } from '../hooks/useGithubResources';
import CategoryAdCards from './CategoryAdCards';
import GithubResourcesGrid from './GithubResourcesGrid';
import '../styles/external-resources.css';

const ExternalResourcesList = ({ showAds = true, onBook }) => {
  const grid = useGithubResources();

  return (
    <>
      {showAds && !grid.loading && !grid.error && grid.resources.length > 0 && (
        <CategoryAdCards
          resources={grid.resources}
          activeType={grid.typeFilter}
          onSelectType={grid.setTypeFilterAndReset}
        />
      )}
      <GithubResourcesGrid grid={grid} onBook={onBook} />
    </>
  );
};

export default ExternalResourcesList;
