// frontend/src/__tests__/DrugTable.more.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import DrugTable from '../components/DrugTable';
import * as api from '../api';

// mock the api module
jest.mock('../api');

const mockConfig = {
  columns: [
    { key: 'id', label: 'Id' },
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'launchDate', label: 'Launch Date' }
  ]
};

const mockDrugs = [
  // intentionally out-of-order dates to test sorting
  { _id: 'a', code: 'C3', genericName: 'gamma', brandName: 'G', company: 'Co C', launchDate: '2018-01-01T00:00:00Z' },
  { _id: 'b', code: 'A1', genericName: 'alpha', brandName: 'A', company: 'Co A', launchDate: '2021-05-10T00:00:00Z' },
  { _id: 'c', code: 'B2', genericName: 'beta', brandName: 'B', company: 'Co B', launchDate: '2019-07-20T00:00:00Z' },
];

beforeEach(() => {
  // default mock implementations; individual tests override as needed
  api.fetchConfig.mockResolvedValue(mockConfig);
  api.fetchCompanies.mockResolvedValue(['Co A', 'Co B', 'Co C']);
  api.fetchDrugs.mockResolvedValue(mockDrugs.slice().sort((x, y) => new Date(y.launchDate) - new Date(x.launchDate)));
});

afterEach(() => {
  jest.clearAllMocks();
});

// TEST 1: renders table headers from config
test('renders table headers based on backend config', async () => {
  render(<DrugTable />);

  // wait for config to be fetched and table to render
  await waitFor(() => expect(api.fetchConfig).toHaveBeenCalled());

  // headers should be visible
  expect(screen.getByText('Id')).toBeInTheDocument();
  expect(screen.getByText('Code')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Company')).toBeInTheDocument();
  expect(screen.getByText('Launch Date')).toBeInTheDocument();
});

// TEST 2: rows are sorted by launchDate descending
test('orders rows by launch date descending', async () => {
  render(<DrugTable />);

  // wait for data to load
  await waitFor(() => expect(api.fetchDrugs).toHaveBeenCalled());

  // table body rows (excluding header)
  const rows = await screen.findAllByRole('row');
  // first row is header, so row index 1 corresponds to first data row
  const firstDataRow = rows[1];
  // check code cell within the row
  const { getAllByRole } = within(firstDataRow);
  // simpler: search for the first code cell via text
  expect(within(firstDataRow).getByText('A1')).toBeInTheDocument();
  // confirm the topmost code is the one with latest date (A1: 2021-05-10)
});

// TEST 3: dropdown contains all distinct companies from API
test('populates company dropdown from /drugs/companies', async () => {
  render(<DrugTable />);

  // wait for companies fetch
  await waitFor(() => expect(api.fetchCompanies).toHaveBeenCalled());

  const select = screen.getByTestId('company-select');

  // Using DOM methods to locate the option inside the select (avoids matching anchor text)
  const optionEls = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
  expect(optionEls).toEqual(expect.arrayContaining(['All Companies', 'Co A', 'Co B', 'Co C']));

  // Alternatively assert there is exactly one option element with name 'Co A'
  const coAOptions = Array.from(select.querySelectorAll('option')).filter(o => o.textContent === 'Co A');
  expect(coAOptions.length).toBe(1);
});


// TEST 4: selecting dropdown filters results (and triggers API call)
test('filters by company using dropdown (calls fetchDrugs with selected company)', async () => {
  // make fetchDrugs behave like server filtering
  api.fetchDrugs.mockImplementation((company) => {
    if (!company) return Promise.resolve(mockDrugs.slice().sort((x, y) => new Date(y.launchDate) - new Date(x.launchDate)));
    return Promise.resolve(mockDrugs.filter(d => d.company === company));
  });

  render(<DrugTable />);
  await waitFor(() => expect(api.fetchCompanies).toHaveBeenCalled());

  const select = screen.getByTestId('company-select');
  // choose 'Co B'
  fireEvent.change(select, { target: { value: 'Co B' } });

  await waitFor(() => expect(api.fetchDrugs).toHaveBeenLastCalledWith('Co B'));

  // check only Co B row(s) shown
  expect(screen.queryByText('A1')).toBeNull();
  expect(screen.getByText('B2')).toBeInTheDocument();
});

// TEST 5: clicking company link filters results (and triggers API call)
test('clicking a company link filters by that company', async () => {
  // ensure fetchDrugs returns full list initially
  api.fetchDrugs.mockImplementation((company) => {
    if (!company) return Promise.resolve(mockDrugs.slice().sort((x, y) => new Date(y.launchDate) - new Date(x.launchDate)));
    return Promise.resolve(mockDrugs.filter(d => d.company === company));
  });

  render(<DrugTable />);
  await waitFor(() => expect(api.fetchDrugs).toHaveBeenCalled());

  // find company A link and click it
  const coALink = screen.getByText('Co A', { selector: 'a' });
  fireEvent.click(coALink);

  await waitFor(() => expect(api.fetchDrugs).toHaveBeenLastCalledWith('Co A'));

  // after click, only Co A rows should be visible
  expect(screen.getByText('A1')).toBeInTheDocument();
  expect(screen.queryByText('B2')).toBeNull();
});

// TEST 6: id column increments starting at 1 after filtering
test('displays incremental Ids starting from 1 for visible rows', async () => {
  // filter to Co C which has one row
  api.fetchDrugs.mockImplementation((company) => {
    if (!company) return Promise.resolve(mockDrugs.slice().sort((x, y) => new Date(y.launchDate) - new Date(x.launchDate)));
    return Promise.resolve(mockDrugs.filter(d => d.company === company));
  });

  render(<DrugTable />);
  await waitFor(() => expect(api.fetchDrugs).toHaveBeenCalled());

  // click Co C link
  const coC = screen.getByText('Co C', { selector: 'a' });
  fireEvent.click(coC);

  await waitFor(() => expect(api.fetchDrugs).toHaveBeenLastCalledWith('Co C'));

  // find first data row and ensure Id cell is '1'
  const rows = screen.getAllByRole('row');
  const firstDataRow = rows[1]; // 0 = header, 1 = first data row
  expect(within(firstDataRow).getByText('1')).toBeInTheDocument();
});

// TEST 7: empty state — when API returns empty list, table shows no body rows
test('shows no data rows when fetchDrugs returns empty array', async () => {
  api.fetchDrugs.mockResolvedValue([]);
  api.fetchCompanies.mockResolvedValue([]);

  render(<DrugTable />);
  await waitFor(() => expect(api.fetchDrugs).toHaveBeenCalled());

  // only header row should be present
  const rows = screen.getAllByRole('row');
  // header + 0 data rows => total 1
  expect(rows.length).toBe(1);
});

// TEST 8: deterministic date formatting — mock toLocaleDateString
test('formats launch dates using locale (deterministic)', async () => {
  // Save and mock
  const original = Date.prototype.toLocaleDateString;
  Date.prototype.toLocaleDateString = function () { return '01/05/2021'; };

  // Re-render component
  render(<DrugTable />);
  await waitFor(() => expect(api.fetchDrugs).toHaveBeenCalled());

  // find at least one cell that contains the mocked date
  const formattedCells = screen.queryAllByText('01/05/2021');
  expect(formattedCells.length).toBeGreaterThan(0);

  // restore
  Date.prototype.toLocaleDateString = original;
});

