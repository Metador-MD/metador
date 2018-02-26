<?php

namespace WhereGroup\PluginBundle\Controller;

use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Filesystem\Filesystem;

use WhereGroup\PluginBundle\Entity\Plugin;

/**
 * Class PluginController
 * @package WhereGroup\PluginBundle\Controller
 * @author A.R.Pour
 * @Route("/admin/plugin")
 */
class PluginController extends Controller
{
    /**
     * @Route("/", name="metador_admin_plugin")
     * @Method("GET")
     */
    public function indexAction()
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        return $this->render('MetadorPluginBundle:Plugin:index.html.twig', array(
            'plugins' => $this->get('metador_plugin')->getPlugins('origin')
        ));
    }

    /**
     * @Route("/update", name="metador_admin_plugin_update")
     * @Method("POST")
     */
    public function updateAction()
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        $plugins = array();
        $array   = $this->get('request_stack')->getCurrentRequest()->request->all();

        foreach ($array['plugin'] as $key => $value) {
            if ($value == 1) {
                $plugins[] = $key;
            }
        }

        return $this->render('MetadorPluginBundle:Plugin:update.html.twig', array(
            'plugins' => implode(',', $plugins)
        ));
    }

    /**
     * @Route("/import", name="metador_admin_plugin_import")
     * @Method("GET")
     */
    public function importAction()
    {
        return $this->render('MetadorPluginBundle:Plugin:import.html.twig', array(
            'form' => $this
                ->createFormBuilder(new Plugin())
                ->add('attachment', FileType::class, array('label' => 'Datei', 'label_attr' => array(
                    'class' => 'plugin-label plugin-row'
                ), 'attr' => array(
                    'class' => 'plugin-row'
                )))
                ->add('save', SubmitType::class, array('label' => 'Importieren', 'attr' => array(
                    'class' => 'plugin-row'
                )))
                ->getForm()
                ->createView()
        ));
    }

    /**
     * @Route("/upload", name="metador_admin_plugin_upload")
     * @Method("POST")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function uploadAction(Request $request)
    {
        $kernelPath = $this->get('kernel')->getRootDir();

        $pluginPath = $kernelPath . '/../src/Plugins/';
        $tempPath   = $kernelPath . '/../var/temp/';

        $form = $this->createFormBuilder(new Plugin())
            ->add('attachment', FileType::class, array('label' => 'Datei', 'label_attr' => array(
                'class' => 'plugin-label plugin-row'
            ), 'attr' => array(
                'class' => 'plugin-row'
            )))
            ->add('save', SubmitType::class, array('label' => 'Importieren', 'attr' => array(
                'class' => 'plugin-row'
            )))
            ->getForm();

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $file */
            $file = $form['attachment']->getData();

            if (!$file instanceof UploadedFile) {
                $this->log('error', 'upload', '', 'Datei-Upload ist fehlgeschlagen.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            // get extension
            $extension = $file->guessExtension();

            if (!$extension || $extension !== 'zip') {
                $this->log('error', 'upload', '', 'Hochgeladene Datei ist kein Metador Plugin.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            $pluginFile = $file->move($tempPath, $file->getFilename());

            unset($file);

            // extract to temp folder
            $zip = new \ZipArchive;

            if ($zip->open($pluginFile->getRealPath()) !== true) {
                $this->log('error', 'upload', '', 'Entpacken fehlgeschlagen.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            $tempFolder = $tempPath . $pluginFile->getFilename() . '_dir';
            $zip->extractTo($tempFolder);
            $zip->close();

            $fs = new Filesystem();

            // remove uploaded file
            $fs->remove($pluginFile->getRealPath());

            // find bundles
            $finder = new Finder();
            $finder->in($tempFolder)->directories()->name('*Bundle');

            foreach ($finder as $folder) {
                /** @var SplFileInfo $folder  */
                $copyPath = $pluginPath . $folder->getRelativePath() . '/';

                if (!$fs->exists($pluginPath)) {
                    $fs->mkdir($copyPath, 0644, true);
                }

                if ($fs->exists($copyPath . '/' . $folder->getFilename())) {
                    $this->log('error', 'upload', '', 'Plugin ist existiert bereits.');
                } else {
                    $fs->mirror($folder->getRealPath(), $copyPath . $folder->getFilename());
                }
            }

            $fs->remove($tempFolder);

            return $this->redirectToRoute('metador_admin_plugin');
        }

        return $this->render('MetadorPluginBundle:Plugin:import.html.twig', array(
            'form' => $form->createView()
        ));
    }

    /**
     * @Route("/confirm/{plugin}", name="metador_admin_plugin_confirm")
     * @Method("GET")
     * @param $plugin
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function confirmAction($plugin)
    {
        return $this->render('MetadorPluginBundle:Plugin:confirm.html.twig', array(
            'pluginKey' => $plugin
        ));
    }

    /**
     * @Route("/delete/{plugin}", name="metador_admin_plugin_delete")
     * @Method("POST")
     * @param $plugin
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function deleteAction($plugin)
    {
        $this->get('metador_plugin')->delete($plugin);

        return $this->redirectToRoute('metador_admin_plugin');
    }

    /**
     * @Route("/view/{plugin}", name="metador_admin_plugin_view")
     * @Method({"GET", "POST"})
     * @param $plugin
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewAction($plugin)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_SYSTEM_SUPERUSER')) {
            throw new AccessDeniedException();
        }

        // Show template if exists
        if ($this->get('templating')->exists($plugin . ':Plugin:view.html.twig')) {
            return $this->forward($plugin . ':Plugin:view');
        }

        return $this->render('MetadorPluginBundle:Plugin:view.html.twig');
    }

    /**
     * @Route("/command/config", name="metador_admin_plugin_command_config")
     * @Method("POST")
     */
    public function configAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->update(
                $this->get('request_stack')->getCurrentRequest()->request->all()
            )
        );
    }

    /**
     * @Route("/command/assets", name="metador_admin_plugin_command_assets")
     * @Method("POST")
     */
    public function assetsAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->assetsInstall()
        );
    }

    /**
     * @Route("/command/database", name="metador_admin_plugin_command_database")
     * @Method("POST")
     */
    public function databaseAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->doctrineUpdate()
        );
    }

    /**
     * @Route("/command/cache", name="metador_admin_plugin_command_cache")
     * @Method("POST")
     */
    public function cacheAction()
    {
        return new JsonResponse(
            $this->get('metador_plugin')->clearCache()
        );
    }

    /**
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function log($type, $operation, $id, $message, $parameter = array())
    {
        $log = $this->get('metador_logger')->newLog();

        $log->setType($type)
            ->setMessage($message, $parameter)
            ->setFlashMessage()
            ->setCategory('system')
            ->setOperation($operation)
            ->setIdentifier($id);

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
