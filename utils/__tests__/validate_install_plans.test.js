'use strict';

const { validateInstallPlanIds } = require('../validate-install-plan');

const githubHelpers = require('../github-api-helpers');

jest.mock('@actions/core');
jest.spyOn(global.console, 'error').mockImplementation(() => {});

jest.mock('../github-api-helpers', () => ({
  ...jest.requireActual('../github-api-helpers'),
  filterQuickstartConfigFiles: jest.fn(),
}));

const validQuickstartFilename = 'mock-quickstart-2/config.yml';
const invalidQuickstartFilename1 = 'mock-quickstart-1/config.yml';
const invalidQuickstartFilename2 = 'mock-quickstart-3/config.yml';

const mockGithubAPIFiles = (filenames) =>
  filenames.map((filename) => ({
    sha: '',
    filename: `utils/mock_quickstarts/${filename}`,
    status: 'added',
    additions: 0,
    deletions: 0,
    changes: 0,
    blob_url: '',
    raw_url: '',
    contents_url: '',
    patch: '',
  }));

describe('Action: validate install plan id', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('succeeds with valid install plan id', () => {
    const files = mockGithubAPIFiles([validQuickstartFilename]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    validateInstallPlanIds(files);
    expect(global.console.error).not.toHaveBeenCalled();
  });

  test('fails with invalid install plan id', () => {
    const files = mockGithubAPIFiles([invalidQuickstartFilename1]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    validateInstallPlanIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(4);
  });

  test('fails with one invalid and one install plan id for singular quickstart', () => {
    const files = mockGithubAPIFiles([invalidQuickstartFilename2]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    validateInstallPlanIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(4);
  });

  test('fails with mix of valid and invalid quickstart', () => {
    const files = mockGithubAPIFiles([
      invalidQuickstartFilename1,
      invalidQuickstartFilename2,
      validQuickstartFilename,
    ]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    validateInstallPlanIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(5);
  });
});
