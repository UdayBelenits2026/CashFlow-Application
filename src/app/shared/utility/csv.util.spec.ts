import { downloadCsv } from './csv.util';

describe('downloadCsv', () => {
  let createObjectURLSpy: jasmine.Spy;
  let revokeObjectURLSpy: jasmine.Spy;
  let clickSpy: jasmine.Spy;
  let anchor: HTMLAnchorElement;

  beforeEach(() => {
    createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
    revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    anchor = document.createElement('a');
    clickSpy = spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.returnValue(anchor);
    spyOn(document.body, 'appendChild').and.callThrough();
    spyOn(document.body, 'removeChild').and.callThrough();
  });

  it('should do nothing when there are no rows', () => {
    downloadCsv(['A', 'B'], [], 'empty.csv');
    expect(createObjectURLSpy).not.toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should build a blob, trigger a download and clean up', () => {
    downloadCsv(['Name', 'Amount'], [['Coffee', 5], ['Tea', 3]], 'data.csv');

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.calls.mostRecent().args[0] as Blob;
    expect(blob.type).toContain('text/csv');
    expect(anchor.getAttribute('download')).toBe('data.csv');
    expect(anchor.getAttribute('href')).toBe('blob:mock');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock');
  });

  it('should join headers and rows into CSV content', async () => {
    downloadCsv(['H1', 'H2'], [[1, 2]], 'x.csv');
    const blob = createObjectURLSpy.calls.mostRecent().args[0] as Blob;
    const text = await blob.text();
    expect(text).toBe('H1,H2\n1,2');
  });
});
