"""Station names and order of Prague metro lines A, B and C from PID open data.

Usage:
  python3 scripts/pid_stations.py PID_GTFS.zip           # print each line's stations
  python3 scripts/pid_stations.py PID_GTFS.zip --check   # compare with content/lines/lines.json

Download the feed from https://data.pid.cz/PID_GTFS.zip (ROPID open data).
Order is taken from the most common longest trip in direction 0, then printed
in the direction lines.json uses. Stations that exist in stops.txt but have no
service in the feed window are reported, so temporary closures are visible.
"""
import collections, csv, io, json, sys, zipfile
from pathlib import Path

ROUTES = {'L991': 'A', 'L992': 'B', 'L993': 'C'}


def read(z, name):
    return csv.DictReader(io.TextIOWrapper(z.open(name), encoding='utf-8-sig'))


def gtfs_lines(path):
    z = zipfile.ZipFile(path)
    feed = next(read(z, 'feed_info.txt'))
    trips = {r['trip_id']: r['route_id'] for r in read(z, 'trips.txt') if r['route_id'] in ROUTES and r['direction_id'] == '0'}
    stops = {r['stop_id']: r['stop_name'] for r in read(z, 'stops.txt')}
    seqs = collections.defaultdict(list)
    for r in read(z, 'stop_times.txt'):
        if r['trip_id'] in trips:
            seqs[r['trip_id']].append((int(r['stop_sequence']), stops[r['stop_id']]))
    counts = collections.defaultdict(collections.Counter)
    for t, s in seqs.items():
        counts[ROUTES[trips[t]]][tuple(n for _, n in sorted(s))] += 1
    lines = {lid: list(max(c, key=lambda n: (len(n), c[n]))) for lid, c in counts.items()}
    return feed, lines


def main():
    feed, lines = gtfs_lines(sys.argv[1])
    print(f"feed {feed['feed_start_date']}–{feed['feed_end_date']}")
    if '--check' not in sys.argv:
        for lid in sorted(lines):
            print(lid, len(lines[lid]), ' | '.join(lines[lid]))
        return
    data = json.loads(Path(__file__).resolve().parent.parent.joinpath('content/lines/lines.json').read_text())
    names = {slug: s['name'] for slug, s in data['stations'].items()}
    ok = True
    for line in data['lines']:
        ours = [names[s['station']] for s in line['stops']]
        theirs = lines[line['id']]
        if theirs[0] != ours[0]:
            theirs = theirs[::-1]
        missing = [n for n in ours if n not in theirs]
        extra = [n for n in theirs if n not in ours]
        order_ok = [n for n in ours if n in theirs] == theirs
        print(f"{line['id']}: {len(ours)} in lines.json, {len(theirs)} served in feed; order {'OK' if order_ok else 'DIFFERS'}")
        for n in missing:
            print(f"   no service in this feed window: {n}")
        for n in extra:
            print(f"   in feed but not in lines.json: {n}")
            ok = False
        ok = ok and order_ok
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
