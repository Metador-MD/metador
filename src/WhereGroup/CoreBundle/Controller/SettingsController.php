<?php

namespace WhereGroup\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 * @Route("/admin")
 */
class SettingsController extends Controller
{
    /**
     * @Route("/settings/", name="metador_admin_settings")
     * @Method("GET")
     * @Template()
     */
    public function indexAction()
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_SUPERUSER')) {
            throw $this->createAccessDeniedException();
        }

        /** @var Request $request */
        $request = $this->get('request_stack')->getMasterRequest();

        /** @var  Configuration $configurationManager */
        $configuration = $this->get('metador_configuration');

        $pluginConfiguration = array();

        foreach ($this->get('metador_plugin')->getPlugins() as $pluginKey => $pluginInfo) {
            if ($pluginInfo['active'] === false || !isset($pluginInfo['config'])) {
                continue;
            }

            $pluginConfiguration[$pluginKey] = $pluginInfo;
        }

//        dump($pluginConfiguration);
//        die;

//        if ($request->getMethod() === 'POST') {
//            $params = $request->request->get(self::PLUGIN_KEY);
//
//            foreach ($params as $key => $value) {
//                $pluginConfiguration[$key] = $value;
//                $configuration->set($key, $value, 'Plugin', self::PLUGIN_KEY);
//            }
//        } else {
//            foreach ($configuration->findAll() as $config) {
//                $pluginConfiguration[$config['key']] = $config['value'];
//            }
//        }

        return array(
            'pluginConfiguration' => $pluginConfiguration
        );
    }
}
