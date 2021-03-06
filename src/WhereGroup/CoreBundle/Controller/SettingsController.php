<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Yaml\Yaml;
use WhereGroup\CoreBundle\Component\Configuration;
use WhereGroup\CoreBundle\Entity\Source;

/**
 * @Route("/admin")
 */
class SettingsController extends Controller
{
    /**
     * @Route("/settings/{fragment}", defaults={"fragment" = ""}, name="metador_admin_settings", methods={"GET"})
     * @param $fragment
     * @return Response
     */
    public function indexAction($fragment)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        /** @var  Configuration $configurationManager */
        $configuration = $this->get('metador_configuration');

        $pluginConfiguration = [];
        $sources = $this->get('metador_source')->all();

        foreach ($this->getSettings() as $pluginKey => $pluginInfo) {
            // normalize
            foreach ($pluginInfo['settings'] as $settingKey => $setting) {
                $pluginInfo['settings'][$settingKey]['id'] = $pluginKey . '-config-' . $settingKey;
                $pluginInfo['settings'][$settingKey]['name'] = $pluginKey . '[' . $settingKey . ']';
                $pluginInfo['settings'][$settingKey]['placeholder']
                    = isset($setting['placeholder']) ? $setting['placeholder'] : '';
                $pluginInfo['settings'][$settingKey]['default']
                    = isset($setting['default']) ? $setting['default'] : '';
                $pluginInfo['settings'][$settingKey]['description']
                    = isset($setting['description']) ? $setting['description'] : '';
                $pluginInfo['settings'][$settingKey]['options']
                    = isset($setting['options']) ? $setting['options'] : [];

                // Set active profiles as options
                if (isset($setting['optionSource']) && $setting['optionSource'] === 'source') {
                    /** @var Source $source */
                    foreach ($sources as $source) {
                        $pluginInfo['settings'][$settingKey]['options'][$source->getSlug()] = $source->getName();
                    }
                }

                $value = $configuration->get($settingKey, 'plugin', $pluginKey, '');

                $pluginInfo['settings'][$settingKey]['value']
                    = !empty($value) ? $value : $pluginInfo['settings'][$settingKey]['default'];
            }

            $pluginConfiguration[$pluginKey] = $pluginInfo;
        }

        return $this->render('@MetadorCore/Settings/index.html.twig', [
            'fragment' => $fragment,
            'pluginConfiguration' => $pluginConfiguration
        ]);
    }

    /**
     * @Route("/settings/update", name="metador_admin_settings_update", methods={"POST"})
     */
    public function updateAction()
    {
        /** @var Request $request */
        $request = $this->get('request_stack')->getMasterRequest();

        /** @var  Configuration $configurationManager */
        $configuration = $this->get('metador_configuration');

        $params = $request->request->all();

        foreach ($this->getSettings() as $pluginKey => $pluginInfo) {
            foreach ($pluginInfo['settings'] as $settingKey => $setting) {
                if (!isset($params[$pluginKey][$settingKey])) {
                    $configuration->remove($settingKey, 'plugin', $pluginKey);
                    continue;
                }

                $configuration->set($settingKey, $params[$pluginKey][$settingKey], 'plugin', $pluginKey);
            }
        }

        return $this->redirectToRoute('metador_admin_settings');
    }

    /**
     * @return array
     */
    private function getSettings()
    {
        $result = [];

        $settings = $this->get('metador_plugin')->init()->getPlugins();

        // Read system config
        $coreSettings = Yaml::parse(file_get_contents(__DIR__ . '/../Resources/config/plugin.yml'));

        $settings = array_merge_recursive($coreSettings, $settings);

        unset($coreSettings);

        foreach ($settings as $pluginKey => $pluginInfo) {
            if ((isset($pluginInfo['active']) && $pluginInfo['active'] === false) || !isset($pluginInfo['settings'])) {
                continue;
            }

            $result[$pluginKey] = $pluginInfo;
        }

        return $result;
    }
}
