/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid/Grid';
import DashboardPage from '../utils/DashboardPage';
import { selectFrom, toPairs } from '../vendor/vectors';
import { fromQueryString, URL } from '../vendor/requests';
import TelemetryContainer from '../telemetry/graph';
import {
  quantum32QueryParams,
  quantum64QueryParams,
  statusLabels,
} from './constants';
import { BENCHMARKS, TP6_COMBOS } from './config';
import PerfherderGraphContainer from '../utils/PerfherderGraphContainer';
import { DetailsIcon } from '../utils/icons';
import { TimeDomain } from '../vendor/jx/domains';
import PlaybackSummary from '../playback/summary';

export default class QuantumIndex extends React.Component {
  constructor(props) {
    super(props);
    document.body.classList.add('multipage');

    const { location, match: { params } } = props;
    const urlParams = fromQueryString(location.search);
    this.bits = urlParams.bits || Number.parseInt(params.bits, 10);
    this.mediaPlaybackRows = [
      {
        encoding: 'VP9',
      },
      {
        encoding: 'H264',
      },
    ];

    this.performanceMetricRows = [
      {
        id: 'winOpen',
        title: 'Window Open',
      },
      {
        id: 'tabSwitch',
        title: 'Tab switch',
      },
      {
        id: 'tabClose',
        title: 'Tab close',
      },
      {
        id: 'firstPaint',
        title: 'First paint',
      },
      {
        id: 'sessionRestoreWindow',
        title: 'Session Restore Window ms',
      },
      {
        id: 'sessionRestoreStartupInit',
        title: 'Session Restore Startup Init ms',
      },
      {
        id: 'sessionRestoreStartupOnload',
        title: 'Session Restore Startup Onload ms',
      },
      {
        id: 'tabSwitchUpdate',
        title: 'Tab Switch Update ms',
      },
      {
        id: 'gcAnimation',
        title: 'GC Animation ms',
      },
      {
        id: 'gpuProcessInit',
        title: 'GPU Process Initialization ms',
      },
      {
        id: 'gpuProcessLaunch',
        title: 'GPU Process Launch ms',
      },
      {
        id: 'inputEventCoalesced',
        title: 'Input Event Response Coalesced ms',
      },
      {
        id: 'networkCacheHit',
        title: 'Network Cache Hit ms',
      },
      {
        id: 'networkCacheMiss',
        title: 'Network Cache Miss ms',
      },
      {
        id: 'placesAutocomplete',
        title: 'Places Autocomplete 6  First Results ms',
      },
      {
        id: 'searchServiceInit',
        title: 'Search Service Init ms',
      },
      {
        id: 'timeToDomComplete',
        title: 'Time to DOM Complete ms',
      },
      {
        id: 'timeToDomInteractive',
        title: 'Time to DOM Interactive ms',
      },
      {
        id: 'timeToDomLoading',
        title: 'Time to DOM Loading ms',
      },
      {
        id: 'timeToFirstInteraction',
        title: 'Time to First Interaction ms',
      },
      {
        id: 'timeToNonBlankPaint',
        title: 'Time to Non Blank Paint ms',
      },
      {
        id: 'timeToResponseStart',
        title: 'Time to Response Start ms',
      },
      {
        id: 'webextBackgroundPageLoad',
        title: 'Webext Background Page Load ms',
      },
      {
        id: 'webextContentScriptInjection',
        title: 'Webext Content Script Injection ms',
      },
      {
        id: 'webextExtensionStartup',
        title: 'Webext Extension Startup ms',
      },
      {
        id: 'timeToLoadEventEnd',
        title: 'Time to Load Event End ms',
      },
      {
        id: 'timeToDomContentLoadedEnd',
        title: 'Time to DOM Content Loaded End ms',
      },
      {
        id: 'contentPaintTime',
        title: 'contentful paint Time ms',
      },
      {
        id: 'pageLoad',
        title: 'FX Page Load ms',
      },
      {
        id: 'simpleSessionRestored',
        title: 'Simple Measures Session Restored ms',
      },
      {
        id: 'scalarFirstPaint',
        title: 'Scalars Timestamp - First Paint ms',
      },
      {
        id: 'timeToFirstScroll',
        title: 'Time to First Scroll ms',
      },
    ];
    this.timeDomain = new TimeDomain({ past: '6week', interval: 'day' });
  }


  get is32bits() {
    return this.bits === 32;
  }

  get markedUpSections() {
    return this.sections.map(
      ({
        title, more, rows, cssRowExtraClasses,
      }) => {
        const statusList = toPairs(statusLabels)
          .map(() => 0)
          .fromPairs();

        const section = (
          <Grid container spacing={24}>
            {rows.map((widget, wi) => {
              // Acumulate the section's status
              statusList[widget.props.status] += 1;

              const id = `${wi}${title}`; // make unique id for key

              return (
                <Grid
                  key={`grid_${id}`}
                  item
                  xs={6}
                  className={cssRowExtraClasses ? ` ${cssRowExtraClasses}` : ''}
                >
                  {widget}
                </Grid>
              );
            })}
          </Grid>
        );

        const stati = toPairs(statusList)
          .map((count, status) => {
            const desc = statusLabels[status];

            if (desc && count) {
              return (
                <div
                    // eslint-disable-next-line react/no-array-index-key
                  key={`status-${status}`}
                  className={`header-status header-status-${status}`}
                >
                  <em>{count}</em>
                  {desc}
                </div>
              );
            }

            return null;
          })
          .exists();

        return (
          <div key={title}>
            <h2 className="section-header">
              <span>
                {`${title}`}
                {more && (
                <span>

                  <a href={more} title="show details">
                    <DetailsIcon />
                  </a>
                </span>
                )}
              </span>
              {stati}
            </h2>
            {section}
          </div>
        );
      },
    );
  }

  get platform() {
    return this.is32bits
      ? {
        or: [
          {
            eq: {
              options: 'pgo',
              platform: 'windows7-32',
            },
          },
          {
            eq: {
              options: 'opt',
              platform: 'windows7-32-shippable',
            },
          },
        ],
      }
      : {
        or: [
          {
            eq: {
              options: 'pgo',
              platform: 'windows10-64',
            },
          },
          {
            eq: {
              options: 'opt',
              platform: 'windows10-64-shippable',
            },
          },
        ],
      };
  }

  get performanceFilter() {
    return {
      and: [
        {
          or: [{ missing: 'test' }, { eq: ['test', 'suite'] }],
        },
        this.platform,
        {
          eq: {
            framework: 1,
            repo: 'mozilla-central',
          },
        },
      ],
    };
  }

  get performanceTestRows() {
    return [
      {
        key: 'page-load-(tp5)',
        title: 'Page load (tp5)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'tp5o' } }],
            },
          },
        ],
      },
      {
        key: 'window-opening-(tpaint-e10s)',
        title: 'Window Opening (tpaint e10s)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'tpaint' } }],
            },
          },
        ],
      },
      {
        key: 'start-up-(sessionrestore)',
        title: 'Start-up (sessionrestore)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'sessionrestore' } }],
            },
          },
        ],
      },
      {
        key: 'start-up-(sessionrestore_no_auto_restore)',
        title: 'Start-up (sessionrestore_no_auto_restore)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [
                this.performanceFilter,
                { eq: { suite: 'sessionrestore_no_auto_restore' } },
              ],
            },
          },
        ],
      },
      {
        key: 'start-up-(ts_paint)',
        title: 'Start-Up (ts_paint)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'ts_paint' } }],
            },
          },
        ],
      },
      {
        key: 'tab-opening-(tabpaint)',
        title: 'Tab Opening (tabpaint)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'tabpaint' } }],
            },
          },
        ],
      },
      {
        key: 'tab-animation-(tart)',
        title: 'Tab Animation (TART)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'tart' } }],
            },
          },
        ],
      },
      {
        key: 'tab-switch-(tabswitch)',
        title: 'Tab Switch (tabswitch)',
        series: [
          {
            label: 'Firefox (tabswitch)',
            filter: {
              and: [
                this.performanceFilter,
                { eq: { suite: ['tps', 'tabswitch'] } },
              ],
            },
          },
        ],
      },
      {
        key: 'svg-(tsvg_static)',
        title: 'SVG (tsvg_static)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'tsvg_static' } }],
            },
          },
        ],
      },
      {
        key: 'svg-(tsvgr_opacity)',
        title: 'SVG (tsvgr_opacity)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'tsvgr_opacity' } }],
            },
          },
        ],
      },
      {
        key: 'svg-(tsvgx)',
        title: 'SVG (tsvgx)',
        series: [
          {
            label: 'Firefox',
            filter: {
              and: [this.performanceFilter, { eq: { suite: 'tsvgx' } }],
            },
          },
        ],
      },
    ];
  }

  get quantumQueryParams() {
    return this.bits32 ? quantum32QueryParams : quantum64QueryParams;
  }

  get sections() {
    return [
      {
        title: 'Benchmarks',
        rows: selectFrom(BENCHMARKS)
          .where({ bits: this.bits, platform: ['win32', 'win64'] })
          .groupBy('suite')
          .map((browsers, suite) => this.makePerfherderGraphContainer({
            key: suite,
            title: suite,
            urls: {
              title: 'see details',
              url: URL({
                path: '/quantum/subtests',
                query: { suite, platform: this.platform },
              }),
              icon: DetailsIcon,
            },
            series: browsers.map(({ browser, filter, ...rest }) => ({
              label: browser,
              filter: { and: [{ missing: 'test' }, filter] },
              ...rest,
            })),
          })),
      },
      {
        title: 'Page Load tests (TP6)',
        more: URL({
          path: '/quantum/tp6',
          query: {
            platform: TP6_COMBOS.where({ os: 'win', bits: this.bits })
              .select('platform')
              .first(),
            test: 'warm-loadtime',
          },
        }),
        rows: selectFrom(TP6_COMBOS)
          .where({
            os: 'win',
            bits: this.bits,
            test: 'warm-loadtime',
            site: [
              'Tp6: Facebook',
              'Tp6: Amazon',
              'Tp6: YouTube',
              'Tp6: Google',
            ],
          })
          .groupBy('site')
          .map((series, site) => this.makePerfherderGraphContainer({
            key: `page_${site}_${this.bits}`,
            title: site,
            series: selectFrom(series)
              .sort(['ordering'])
              .map(({ browser, platform, filter }) => ({
                label: `${browser} (${platform})`,
                filter,
              })),
          }))
          .enumerate(),
      },
      {
        title: 'Media Playback',
        rows: this.mediaPlaybackRows.map(row => this.makePlaybackSummary(row)),
      },
      {
        title: 'Performance Tests',
        rows: this.performanceTestRows.map(row => this.makePerfherderGraphContainer(row)),
      },
      {
        cssRowExtraClasses: 'generic-metrics-graphics photon-perf',
        title: 'Performance Metrics',
        rows: this.performanceMetricRows.map(row => this.makeTelemetryContainer(row)),
      },
    ];
  }

  makePlaybackSummary({ encoding }) {
    return (
      <PlaybackSummary
        key={`${this.bits}_${encoding}`}
        bits={this.bits}
        encoding={encoding}
        browserId="firefox"
      />
    );
  }

  makeTelemetryContainer({ id, ...restParams }) {
    return (
      <TelemetryContainer
        key={id}
        queryParams={this.quantumQueryParams}
        {...restParams}
      />
    );
  }

  makePerfherderGraphContainer({
    key, series, title, urls = null,
  } = {}) {
    return (
      <PerfherderGraphContainer
        key={key}
        series={series}
        timeDomain={this.timeDomain}
        title={title}
        urls={urls}
      />
    );
  }

  renderLimitedSections() {
    const limit = 2;
    return (
      <>
        {selectFrom(this.markedUpSections).limit(limit)}
        <h2 key="moreData">
          More data on
          <strong>https://health.graphics/quantum</strong>
          . Ask questions in
          <strong>#quantum</strong>
           (IRC & Slack)
        </h2>
      </>
    );
  }

  render() {
    const { location: { search } } = this.props;
    const { full } = fromQueryString(search);
    document.body.classList[full ? 'add' : 'remove']('summary-fullscreen');
    return (
      <DashboardPage title="Quantum" subtitle="Release Criteria Report">
        {full ? this.renderLimitedSections() : this.markedUpSections}
      </DashboardPage>
    );
  }
}

QuantumIndex.propTypes = {
  location: PropTypes.object,
};
