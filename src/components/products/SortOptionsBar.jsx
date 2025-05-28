import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonGroup, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { SortDown, SortUp, Stars, ClockHistory } from 'react-bootstrap-icons';
import '../../styles/sort-options-bar.css';
import { useTranslation } from 'react-i18next'; 
function SortOptionsBar() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentSortBy = searchParams.get('sortBy') || 'createdAt';
    const currentSortDir = searchParams.get('sortDir') || 'desc';

    const handleSortChange = (sortBy, sortDir) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sortBy', sortBy);
        newParams.set('sortDir', sortDir);
        newParams.set('page', '0'); // Reset về trang đầu
        setSearchParams(newParams);
    };

    const isSortActive = (sortBy, sortDir) => currentSortBy === sortBy && currentSortDir === sortDir;

    return (
    <div className="sort-options-bar d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3 p-2">
      <span className="me-2 text-muted small fw-semibold">{t('sortOptionsBar.sortByLabel', 'Sắp xếp theo:')}</span>
      <ButtonGroup size="sm">
        {/* <Button variant={isSortActive('relevance', 'desc') ? 'primary' : 'outline-secondary'} onClick={() => handleSortChange('relevance', 'desc')}> <Stars className="me-1" /> {t('sortOptionsBar.relevance', 'Phù hợp')} </Button> */}
        <Button variant={isSortActive('createdAt', 'desc') ? 'primary' : 'outline-secondary'} onClick={() => handleSortChange('createdAt', 'desc')}> <ClockHistory className="me-1" /> {t('sortOptionsBar.newest', 'Mới nhất')} </Button>
        <Button variant="outline-secondary" disabled title={t('sortOptionsBar.comingSoon', 'Sắp có')}> 🔥 {t('sortOptionsBar.bestSelling', 'Bán chạy')} </Button>
      </ButtonGroup>
      <DropdownButton
        id="sort-price-dropdown" variant="outline-secondary" size="sm"
        title={
          isSortActive('price', 'asc') ? t('sortOptionsBar.priceLowToHigh', 'Giá: Thấp đến Cao') :
          isSortActive('price', 'desc') ? t('sortOptionsBar.priceHighToLow', 'Giá: Cao đến Thấp') : t('sortOptionsBar.price', 'Giá')
        }
      >
        <Dropdown.Item active={isSortActive('price', 'asc')} onClick={() => handleSortChange('price', 'asc')}> <SortUp className="me-2" /> {t('sortOptionsBar.lowToHigh', 'Thấp đến Cao')} </Dropdown.Item>
        <Dropdown.Item active={isSortActive('price', 'desc')} onClick={() => handleSortChange('price', 'desc')}> <SortDown className="me-2" /> {t('sortOptionsBar.highToLow', 'Cao đến Thấp')} </Dropdown.Item>
      </DropdownButton>
    </div>
  );
}

export default SortOptionsBar;
