import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  integrationHub, 
  INTEGRATION_SERVICES_CATALOG, 
  NormalizedObservation, 
  ImdWeatherObservation, 
  CwcRiverObservation 
} from './integrationHub';

test('IntegrationHub: service catalog contains 15 prioritized infrastructure services with truth states', () => {
  assert.equal(INTEGRATION_SERVICES_CATALOG.length, 15);
  const serviceIds = INTEGRATION_SERVICES_CATALOG.map(s => s.id);
  assert.ok(serviceIds.includes('postgres-postgis'));
  assert.ok(serviceIds.includes('fastapi-ws'));
  assert.ok(serviceIds.includes('traccar-gps'));
  assert.ok(serviceIds.includes('imd-weather'));
  assert.ok(serviceIds.includes('cwc-river-gauge'));
  assert.ok(serviceIds.includes('sarvam-bhashini'));

  // Truth contract check: unconfigured vendor services must be explicitly marked NOT_CONFIGURED
  const notConfigured = INTEGRATION_SERVICES_CATALOG.filter(s => s.status === 'NOT_CONFIGURED');
  assert.ok(notConfigured.length >= 5);
  assert.ok(notConfigured.some(s => s.id === 'cwc-river-gauge'));
});

test('IntegrationHub: correctly publishes and stores normalized observations', () => {
  const testObs: NormalizedObservation = {
    eventId: 'test_obs_001',
    eventType: 'crowd.observation',
    zoneId: 'kotilingala_ghat',
    source: 'camera_kotilingala_south',
    sourceMode: 'calibrated_simulation',
    observedAt: new Date().toISOString(),
    ingestedAt: new Date().toISOString(),
    measurement: { count: 450, density: 1.2 },
    confidence: 0.92,
    status: 'fresh',
    dpdpCompliant: true
  };

  let received: NormalizedObservation | null = null;
  const unsubscribe = integrationHub.subscribe(obs => {
    if (obs.eventId === 'test_obs_001') {
      received = obs;
    }
  });

  integrationHub.publishObservation(testObs);
  unsubscribe();

  assert.ok(received !== null);
  const validObs = received as unknown as NormalizedObservation;
  assert.equal(validObs.eventId, 'test_obs_001');
  assert.equal(validObs.status, 'fresh');
  assert.equal(validObs.dpdpCompliant, true);
});

test('IntegrationHub: freshness watchdog flags stale feeds when silence exceeds threshold', () => {
  const freshTime = Date.now() - 5000; // 5 seconds ago (under 15s limit)
  const staleTime = Date.now() - 25000; // 25 seconds ago (over 15s limit)

  assert.equal(integrationHub.evaluateSourceFreshness('test_source_fresh', freshTime), 'fresh');
  assert.equal(integrationHub.evaluateSourceFreshness('test_source_stale', staleTime), 'stale');
  assert.equal(integrationHub.evaluateSourceFreshness('unknown_unseen_device'), 'offline');
});

test('IntegrationHub: DPDP Act 2023 compliance validator flags and protects PII', () => {
  const compliantData = { person_count: 520, velocity_mps: 1.2, density: 2.1 };
  assert.equal(integrationHub.validateDpdpCompliance(compliantData), true);

  const nonCompliantData = { person_count: 520, phone_number: '+919876543210' };
  assert.equal(integrationHub.validateDpdpCompliance(nonCompliantData), false);

  const nonCompliantAadhaar = { aadhaar: '1234-5678-9012' };
  assert.equal(integrationHub.validateDpdpCompliance(nonCompliantAadhaar), false);
});

test('IntegrationHub: Traccar fleet positions and telemetry updates work correctly', () => {
  const vehicles = integrationHub.getVehicles();
  assert.ok(vehicles.length >= 6);

  const shuttle = vehicles.find(v => v.type === 'EV_SHUTTLE');
  assert.ok(shuttle);
  assert.ok(shuttle.speedKmh >= 0);
  assert.ok(shuttle.batteryOrFuelPercent > 0);
  assert.ok(shuttle.coordinates.lat > 16.0 && shuttle.coordinates.lat < 18.0);

  const boat = vehicles.find(v => v.type === 'SDRF_PATROL_BOAT');
  assert.ok(boat);
  assert.ok(boat.status === 'IN_TRANSIT');
});

test('IntegrationHub: IMD Weather and CWC River hydrological data are properly formatted', () => {
  const weather: ImdWeatherObservation = integrationHub.getImdWeather();
  assert.ok(weather.temperatureC > 20 && weather.temperatureC < 50);
  assert.ok(weather.heatIndexC >= weather.temperatureC);
  assert.ok(weather.humidityPercent > 0 && weather.humidityPercent <= 100);
  assert.ok(weather.pilgrimAdvisory.length > 10);

  const river: CwcRiverObservation = integrationHub.getCwcRiver();
  assert.ok(river.dischargeCusecs > 0);
  assert.ok(river.currentWaterLevelMeters < river.dangerWaterLevelMeters);
  assert.equal(river.trend, 'STABLE');
});

test('IntegrationHub: Sarvam / Bhashini multilingual query processor responds accurately', () => {
  // Telugu test
  const teResponse = integrationHub.processVoiceQuery('కోటిలింగాల ఘాట్ రద్దీ ఎలా ఉంది?', 'te');
  assert.equal(teResponse.language, 'te');
  assert.equal(teResponse.intent, 'GHAT_CROWD');
  assert.ok(teResponse.responseText.includes('కోటిలింగాల'));

  // Hindi test
  const hiResponse = integrationHub.processVoiceQuery('घाट पर भीड़ की क्या स्थिति है?', 'hi');
  assert.equal(hiResponse.language, 'hi');
  assert.equal(hiResponse.intent, 'GHAT_CROWD');

  // English test
  const enResponse = integrationHub.processVoiceQuery('Where can I get drinking water and food?', 'en');
  assert.equal(enResponse.language, 'en');
  assert.equal(enResponse.intent, 'NEAREST_FACILITY');
  assert.ok(enResponse.responseText.includes('Drinking Water'));
});
