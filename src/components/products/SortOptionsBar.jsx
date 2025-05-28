import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonGroup, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { SortDown, SortUp, Stars, ClockHistory } from 'react-bootstrap-icons';
import '../../styles/sort-options-bar.css';

function SortOptionsBar() {
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
            <span className="me-2 text-muted small fw-semibold">Sắp xếp theo:</span>
            <ButtonGroup size="sm">
                <Button
                    variant={isSortActive('relevance', 'desc') ? 'primary' : 'outline-secondary'}
                    onClick={() => handleSortChange('relevance', 'desc')}
                    disabled={!searchParams.get('name')}
                >
                    <Stars className="me-1" /> Phù hợp
                </Button>
                <Button
                    variant={isSortActive('createdAt', 'desc') ? 'primary' : 'outline-secondary'}
                    onClick={() => handleSortChange('createdAt', 'desc')}
                >
                    <ClockHistory className="me-1" /> Mới nhất
                </Button>
                <Button
                    variant="outline-secondary"
                    disabled
                    title="Sắp có"
                >
                    🔥 Bán chạy
                </Button>
            </ButtonGroup>

            <DropdownButton
                id="sort-price-dropdown"
                variant="outline-secondary"
                size="sm"
                title={
                    isSortActive('price', 'asc') ? 'Giá: Thấp đến Cao' :
                    isSortActive('price', 'desc') ? 'Giá: Cao đến Thấp' : 'Giá'
                }
            >
                <Dropdown.Item
                    active={isSortActive('price', 'asc')}
                    onClick={() => handleSortChange('price', 'asc')}
                >
                    <SortUp className="me-2" /> Thấp đến Cao
                </Dropdown.Item>
                <Dropdown.Item
                    active={isSortActive('price', 'desc')}
                    onClick={() => handleSortChange('price', 'desc')}
                >
                    <SortDown className="me-2" /> Cao đến Thấp
                </Dropdown.Item>
            </DropdownButton>
        </div>
    );
}

export default SortOptionsBar;
